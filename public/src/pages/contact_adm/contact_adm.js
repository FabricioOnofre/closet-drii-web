const mensagensContato = [
    {
        id: 1,
        nome: "Maria Silva",
        email: "maria@email.com",
        assunto: "Dúvidas sobre Peças",
        mensagem: "Gostaria de saber qual tamanho de jaqueta vocês recomendam para uma pessoa com 1,68m de altura e 72kg. Normalmente uso tamanho M, mas vi nos comentários que esse modelo pode ter uma forma maior que o padrão.",
        respondida: false
    },
    {
        id: 2,
        nome: "João Pereira",
        email: "joao@email.com",
        assunto: "Trocas e Devoluções",
        mensagem: "Recebi meu pedido hoje, porém o tamanho da camisa não serviu corretamente. Gostaria de saber como funciona o processo de troca e se existe algum custo para envio da peça de volta.",
        respondida: false
    },
    {
        id: 3,
        nome: "Ana Carolina Pereira",
        email: "ana@email.com",
        assunto: "Dúvidas sobre Peças",
        mensagem: "Estive navegando pelo site e gostei bastante das jaquetas jeans e camisetas oversized. Gostaria de saber se as medidas da tabela de tamanhos são exatas e se há previsão de reposição para alguns tamanhos.",
        respondida: false
    },
    {
        id: 4,
        nome: "Carlos Eduardo Souza",
        email: "carlos.souza@email.com",
        assunto: "Status do Pedido",
        mensagem: "Realizei uma compra há cinco dias e o rastreamento não foi atualizado desde então. Gostaria de confirmar se o pedido já foi enviado e qual a previsão de entrega.",
        respondida: false
    },
    {
        id: 5,
        nome: "Fernanda Alves",
        email: "fernanda@email.com",
        assunto: "Status do Pedido",
        mensagem: "Meu pedido consta como processado há alguns dias. Gostaria de saber se existe alguma previsão para a postagem e se receberei um código de rastreamento.",
        respondida: false
    },
    {
        id: 6,
        nome: "Ricardo Martins",
        email: "ricardo@email.com",
        assunto: "Trocas e Devoluções",
        mensagem: "Recebi uma camiseta em uma cor diferente da selecionada no momento da compra. Gostaria de saber quais são os procedimentos para solicitar a troca do produto.",
        respondida: false
    },
    {
        id: 7,
        nome: "Juliana Rocha",
        email: "juliana@email.com",
        assunto: "Sugestões / Outros",
        mensagem: "Gostaria de sugerir que o site disponibilizasse mais fotos dos produtos sendo utilizados por modelos de diferentes biotipos. Isso ajudaria bastante na escolha dos tamanhos.",
        respondida: true
    },
    {
        id: 8,
        nome: "Gabriel Henrique Lima",
        email: "gabriel@email.com",
        assunto: "Dúvidas sobre Peças",
        mensagem: "Olá, equipe! Estive navegando pelo site de vocês e gostei bastante de algumas peças da nova coleção, especialmente das jaquetas jeans e das camisetas oversized. No entanto, antes de realizar minha compra, gostaria de esclarecer algumas dúvidas. Primeiramente, gostaria de saber se as medidas informadas na tabela de tamanhos correspondem exatamente ao produto ou se existe alguma margem de variação. Costumo utilizar tamanho M, mas dependendo do modelo e da modelagem da roupa, às vezes preciso optar pelo tamanho G para obter um caimento mais confortável. Além disso, tenho interesse na Jaqueta Jeans Classic Azul, mas percebi que alguns tamanhos estão indisponíveis no momento. Existe alguma previsão de reposição de estoque para os tamanhos M e G? Caso haja, qual seria o prazo aproximado para que esses itens voltem a ficar disponíveis para compra? Também gostaria de entender melhor a política de trocas e devoluções. Caso eu compre uma peça e o tamanho não fique adequado, é possível solicitar a troca por outro tamanho? Existe algum prazo específico para realizar essa solicitação e há algum custo de envio para o cliente nesse processo? Por fim, gostaria de saber se os tecidos utilizados nas camisetas da coleção são 100% algodão ou se possuem alguma composição com poliéster ou elastano. Tenho preferência por tecidos mais leves e respiráveis, principalmente para uso diário.",
        respondida: false
    },
    {
        id: 9,
        nome: "Patrícia Mendes",
        email: "patricia@email.com",
        assunto: "Sugestões / Outros",
        mensagem: "Gostaria de parabenizar a equipe pela qualidade do atendimento e pela organização do site. Também sugiro a inclusão de uma lista de desejos para que os clientes possam salvar produtos para compras futuras.",
        respondida: true
    }
];

function marcarMensagemRespondida(buttonID){
    for(let item of mensagensContato){
        if(item.id == buttonID){
            item.respondida = true;
            break;
        }
    }

    carregarMensagens();
}

function carregarMensagens() {
    let main = document.getElementsByTagName('main')[0];
    main.innerHTML = "";

    for (let item of mensagensContato) {
        if (item.respondida === false) {
            let section = document.createElement('section');

            let header = document.createElement('div');
            header.classList.add('message-header');

            let nome = document.createElement('h1');
            nome.innerHTML = item.nome;
            let email = document.createElement('h3');
            email.innerHTML = item.email;

            header.appendChild(nome);
            header.appendChild(email);

            let body = document.createElement('div');
            body.classList.add('message-body');

            let assunto = document.createElement('p');
            assunto.classList.add('assunto');
            assunto.innerHTML = item.assunto;
            let mensagem = document.createElement('p');
            mensagem.classList.add('mensagem');
            mensagem.innerHTML = item.mensagem;

            let button = document.createElement("button");
            button.innerHTML = "Marcar como respondido";
            button.classList.add('readMessage-btn');
            button.id = item.id;
            button.addEventListener('click', () =>{
                marcarMensagemRespondida(button.id);
            });

            body.appendChild(assunto);
            body.appendChild(mensagem);

            section.appendChild(header);
            section.appendChild(body);
            section.appendChild(button);

            main.appendChild(section);
        }
    }
}

document.addEventListener("DOMContentLoaded", carregarMensagens);