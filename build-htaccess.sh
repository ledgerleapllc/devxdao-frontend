#!/bin/bash -ex
cat <<EOF > out/.htaccess
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]
RewriteCond %{SERVER_PORT} 80
RewriteCond %{HTTP_HOST} ^portal.devxdao.com$
RewriteRule ^(.*)$ https://portal.devxdao.com/$1 [L,R=301,NC]
EOF