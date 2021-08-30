const knex = require('../../conexao');

const adicionarPedido = async (req, res) => {
    const { produtos, endereco, subtotal, entrega } = req.body;
    const { id, nome } = req.cliente;

    if (!produtos) {
        return res.status(404).json('Adicione pelo menos 1 produto ao pedido.');
    }
    if(!endereco) {
        return res.status(400).json('Endereço é obrigatório');
    }
    for(produto of produtos){
        if(!produto.ativo){
            return res.status(400).json('Produto fora de estoque ou desativado');
        }
    }

    try {

        const inserindoPedido = await knex('pedido').insert({
            cliente_id: id,
            restaurante_id: produtos[0].restaurante_id,
            nome_cliente: nome,
            cep: endereco.cep,
            endereco: endereco.endereco,
            complemento: endereco.complemento,
            subtotal: subtotal,
            total: (subtotal + entrega),
            entrega: entrega
        }).returning('*');

        if (!inserindoPedido) {
            return res.status(404).json('O pedido não foi adicionado.');
        }

        for (produto of produtos) {
            
            const inserindoProdutos = await knex('itens').insert({
                pedido_id: inserindoPedido[0].id,
                quantidade: produto.quantidade,
                preco_produto: produto.valor_produto,
                imagem_produto: produto.imagem_produto,
                nome_produto: produto.nome_produto
            });
        

            if (!inserindoProdutos) {
                return res.status(404).json('Os itens não foram adicionados ao pedido.');
            }
        }

        return res.status(200).json(`Pedido cadastrado com sucesso!`);

    } catch (error) {
        return res.status(400).json(error.message);
    }
}


module.exports = {
    adicionarPedido
}