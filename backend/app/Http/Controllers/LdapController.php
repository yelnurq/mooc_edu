<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use App\Models\User;

class LdapController extends Controller
{
    /**
     * Приватный метод для подключения к LDAP
     */
    private function connectLdap()
    {
        $ldapHost = env('LDAP_HOST', 'ldap://10.0.1.30');
        $ldapPort = env('LDAP_PORT', 389);
        $user = env('LDAP_BIND_USER');
        $password = env('LDAP_BIND_PASSWORD');

        putenv('LDAPTLS_REQCERT=never');
        @ldap_set_option(null, LDAP_OPT_X_TLS_REQUIRE_CERT, LDAP_OPT_X_TLS_NEVER);

        $ldapConn = @ldap_connect($ldapHost, $ldapPort);

        if (!$ldapConn) return false;

        ldap_set_option($ldapConn, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldapConn, LDAP_OPT_REFERRALS, 0);

        if (!@ldap_start_tls($ldapConn)) {
            ldap_unbind($ldapConn);
            return false;
        }

        if (!@ldap_bind($ldapConn, $user, $password)) {
            ldap_unbind($ldapConn);
            return false;
        }

        return $ldapConn;
    }

    /**
     * Получение всех пользователей (для списка в React)
     */
    public function getAllLdapUsers()
    {
        $ldapConn = $this->connectLdap();
        if (!$ldapConn) {
            return response()->json(['status' => 'error', 'message' => 'LDAP connection/bind failed'], 500);
        }

        $baseDn = "OU=Univer,DC=kaztbu,DC=edu,DC=kz";
        $filter = "(&(objectCategory=person)(objectClass=user))";
        $attributes = ["cn", "userPrincipalName", "position", "department", "displayname", "company", "mobile"];
        
        $users = [];
        $pageSize = 500; 
        $cookie = '';

        do {
            $controls = [['oid' => LDAP_CONTROL_PAGEDRESULTS, 'iscritical' => true, 'value' => ['size' => $pageSize, 'cookie' => $cookie]]];
            $search = @ldap_search($ldapConn, $baseDn, $filter, $attributes, 0, 0, 0, LDAP_DEREF_NEVER, $controls);

            if (!$search) break;

            ldap_parse_result($ldapConn, $search, $errcode, $matcheddn, $errmsg, $referrals, $controls_response);
            $entries = ldap_get_entries($ldapConn, $search);

            for ($i = 0; $i < $entries["count"]; $i++) {
    $users[] = [
        'name' => $entries[$i]["displayname"][0] ?? ($entries[$i]["cn"][0] ?? 'N/A'),
        
        'userPrincipalName' => $entries[$i]["userprincipalname"][0] ?? 'N/A', 
        
        'company'    => $entries[$i]["company"][0] ?? 'N/A',
        
        'position'   => $entries[$i]["title"][0] ?? 'N/A', 
        
        'mobile' => $entries[$i]["mobile"][0] ?? 'N/A',
    ];
}
            $cookie = $controls_response[LDAP_CONTROL_PAGEDRESULTS]['value']['cookie'] ?? '';

        } while ($cookie !== null && $cookie != '');

        ldap_unbind($ldapConn);

        return response()->json([
            'status' => 'success',
            'total_found' => count($users),
            'users' => $users
        ]);
    }

    /**
     * Импорт одного пользователя
     */
public function importSingleUser(Request $request)
{
    $inputEmail = trim($request->input('email'));
    $inputName = trim($request->input('name'));

    // Экранируем ввод, чтобы предотвратить LDAP-инъекцию
    // Флаг LDAP_ESCAPE_FILTER заменяет спецсимволы (*, (, ), \, NUL) на безопасные последовательности
    $safeEmail = ldap_escape($inputEmail, '', LDAP_ESCAPE_FILTER);
    $safeName = ldap_escape($inputName, '', LDAP_ESCAPE_FILTER);

    if (!$inputEmail || $inputEmail === 'N/A') {
        // Используем экранированное имя
        $filter = "(|(cn=$safeName)(displayname=$safeName))";
    } else {
        // Используем экранированный email/логин
        $filter = "(|(mail=$safeEmail)(userPrincipalName=$safeEmail)(sAMAccountName=$safeEmail))";
    }

    $ldapConn = $this->connectLdap();
    if (!$ldapConn) return response()->json(['message' => 'LDAP connection failed'], 500);

    $baseDn = "OU=Univer,DC=kaztbu,DC=edu,DC=kz";
    $attributes = ["cn", "mail", "title", "department", "displayname", "mobile", "userprincipalname", "samaccountname"];

    // Выполняем поиск с безопасным фильтром
    $search = @ldap_search($ldapConn, $baseDn, $filter, $attributes);
    
    if (!$search) {
        ldap_unbind($ldapConn);
        return response()->json(['message' => 'Ошибка при поиске в LDAP'], 500);
    }

    $entries = ldap_get_entries($ldapConn, $search);

    if ($entries['count'] == 0) {
        ldap_unbind($ldapConn);
        return response()->json([
            'message' => "Пользователь не найден в AD.",
            // В продакшене лучше не выводить debug_filter, чтобы не помогать злоумышленникам
            'debug_info' => "Email: $inputEmail, Name: $inputName"
        ], 404);
    }

    $entry = $entries[0];
    
    $ldapEmail = $entry['mail'][0] ?? ($entry['userprincipalname'][0] ?? null);
    
    if (!$ldapEmail) {
        $login = $entry['samaccountname'][0] ?? \Illuminate\Support\Str::slug($inputName);
        $ldapEmail = $login . "@kaztbu.edu.kz";
    }

    $user = \App\Models\User::updateOrCreate(
        ['email' => $ldapEmail],
        [
            'name' => $entry['displayname'][0] ?? ($entry['cn'][0] ?? $inputName),
            'position' => $entry['title'][0] ?? 'Сотрудник',
            'department' => $entry['department'][0] ?? 'Университет',
            'mobile' => $entry['mobile'][0] ?? 'N/A',
            'password' => bcrypt(\Illuminate\Support\Str::random(16)), 
            'email_verified_at' => now(),
            'auth_type' => 'ldap',
        ]
    );

    ldap_unbind($ldapConn);

    return response()->json([
        'status' => 'success',
        'message' => "Успешно: " . $user->name,
        'user' => $user
    ]);
}
}