#!/bin/bash
# Script para ativar o plugin PHD Products no WordPress Docker

echo "🔍 Verificando se o plugin está instalado..."

# Verificar se o plugin existe
if docker exec wp_wordpress test -f /var/www/html/wp-content/plugins/phd-products/phd-products.php; then
    echo "✅ Plugin encontrado!"
else
    echo "❌ Plugin não encontrado. Verifique se os arquivos foram copiados corretamente."
    exit 1
fi

echo ""
echo "📝 Ativando plugin via PHP direto..."

# Ativar plugin via PHP
docker exec wp_wordpress php -r "
define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

if (!function_exists('activate_plugin')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

\$plugin = 'phd-products/phd-products.php';
\$result = activate_plugin(\$plugin);

if (is_wp_error(\$result)) {
    echo '❌ Erro ao ativar: ' . \$result->get_error_message() . PHP_EOL;
    exit(1);
} else {
    echo '✅ Plugin ativado com sucesso!' . PHP_EOL;
    echo '📋 Tabela wp_phd_products será criada automaticamente.' . PHP_EOL;
    echo '🌐 Acesse: http://localhost:8080/wp-admin/admin.php?page=phd-products' . PHP_EOL;
}
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Plugin ativado!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Acesse: http://localhost:8080/wp-admin"
    echo "2. Vá em 'PHD Studio' → 'Todos os Produtos'"
    echo "3. Verifique se os produtos foram criados"
else
    echo ""
    echo "⚠️  Se o script falhou, ative manualmente via WordPress Admin:"
    echo "1. Acesse: http://localhost:8080/wp-admin"
    echo "2. Vá em Plugins → Plugins Instalados"
    echo "3. Procure por 'PHD Studio - Gerenciamento de Produtos'"
    echo "4. Clique em 'Ativar'"
fi



