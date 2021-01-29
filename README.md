Sistema de Certificados Tchelinux
=================================

O `Sistema de Certificados Tchelinux` foi desenvolvido para prover certificados de participação, organização ou produção de conteúdo para os eventos e para os canais de publicação disponibilizados pelo [Grupo de Usuários de Software Livre Tchelinux].

São imaginados três usuários para o sistema, o usuário que deseja obter um certificado, um usuário que deseja validar um certificado recebido, e um usuário que irá criar os certificados do sistema.


Obtendo um Certificado
----------------------

Para obter os certificados emitidos pelo sistema, o usuário deve acessar [https:/certificados.tchelinux.org], entrar com o e-mail utilizado para a sua inscrição nos eventos, e pressionar o botão `Requisitar`.

Uma lista com todos os eventos que o usuário tem certificados disponíveis, ordenada do evento mais recente para o mais antigo, será exibida, e o usuário pode obter os certificados clicando no evento desejado.

O certificado terá um código de verificação que pode ser utilizado para validação dos dados do certificado posteriormente.

Mesmo que o usuário tenha realizado várias contribuições diferentes para o evento, recebendo um certificado com múltiplas páginas, sendo uma página por contribuição, o código de verificação ainda será único para aquele usuário, naquele evento.


Validando um Certificado
------------------------

Existem três formas de validar um certificado emitido pelo sistema, que pode depender de quando o certificado foi obtido, devido a atualizações do sistema.

Para todos os certificados já emitidos, o certificado pode ser validade, acessando [https://certificados.tchelinux.org] e digitando o `Código de Verificação`, presente na parte inferior direita do certificado, no campo correspondente e pressionando o botão `Verificar`. Serão exibidos os dados referente àquele certificado e o seu _status_. O status de um certificado pode ser `valido`, `inválido`, ou `revogado`.

Certificados mais novos, gerados a partir do ano 2021, possuem um _link_ ativo no `Código de Verificação`, e,  se o leitor de PDF utilizado tiver suporte a abrir _links_, basta clicar sobre o código de verificação que a página de verificação será apresentada em um navegador.

A terceira forma é digitando diretamente a url em um navegador, incluindo o código de verificação:

```
https://certificados.tchelinux.org/?verify=010101010101010...
```

Assim como no caso do _link_ ativo, presente no certificado, será apresentado o resultado da validação.


Gerando Novos Certificados
--------------------------

Para gerar novos certificados o usuário deverá utilizar a ferramenta `utils/make_certificates.py`.

Ao executar a ferramenta de geração de certificados, passando os arquivos de configuração, serão gerados os dados necessários para a criação dos certificados em um diretório `certificados`


Arquivos de Configuração para Geração de Certificados
-----------------------------------------------------

São utilizados dois arquivos de configuração para a geração dos dados dos certificados, um arquivo com os dados relativos ao evento, e um arquivo relativo aos dados dos certificados a serem gerados.

Para a utilização de arquivos YAML, é necessário que esteja disponível o `pyyaml`, no momento de executar a ferramenta `utils/make_certificates.py`

O arquivo de configuração do evento pode ser um arquivo JSON, ou YAML, com os seguintes atributos:

| Nome  | Descrição                             | Req. | _Default_ |
| :---- | :------------------------------------ | :---------: | :----: |
| date         | Data (ou data de início e final) em que o evento foi realizado, no formato _AAAA-MM-DD_. [^1] | Sim | - |
| title       | Título do evento. | Não | Seminário de Software Livre / Tchelinux Live [^2] |
| institution  | Nome da instituição onde o evento foi realizado.    | Não [^3] | - |
| city       | Nome da cidade onde o evento foi realizado.         | Não [^3] | - |
| participation | Número de horas a serem atribuídas aos participantes do evento. | Não | 6 |
| organization | Número de horas a serem atribuídas aos organizadores do evento. | Não | 8 |
| type | Pode ser "presential" ou "online". | Não | Ver [^4] |

> [^1]: A data pode ser definida como uma string, uma lista de dois valores (início e fim), ou um dicionário com `from` e `to`.
>
> [^2]: Se o nome da instituição não for definido, assume-se um evento _online_ e o nome "Tchelinux Live \<Mês\> \<Ano\>".
>
> [^3]: Para eventos _online_, sugere-se não utilizar o nome de uma instituição ou cidade.
>
> [^4]: Se `city` for preenchido, é utilizado, como padrão, `presential`, caso conttrário, `online`.

Por exemplo, o seguinte arquivo de configuração foi utilizado para o primeiro evento _online_ do grupo:

```yaml
date: 2020-12-12
title: Tchelinux Live 2020
```

Os dados dos certificados podem estar no formato CSV, com os seguintes campos, nessa ordem:

1. Nome completo
2. E-mail
3. Papel (participante, organizador ou palestrante)  

Do 4° campo em diante, podem ser inseridos os títulos das palestras, caso do papel ser `palestrante`.

Para utilizar dadados de certificado no formato CSV, utilize o parâmetro `-c`:

```
python3 utils/make_certificates.py -c event.yaml palestras.csv particip.csv
```

Autores
-------

Rafael Guterres Jeffman (@rafasgj)


Licença
-------

O Sistema de Certificados Tchelinux está disponível sob a licença ISC. Veja o arquivo [LICENSE].

<!-- Referências -->
[Grupo de Usuários de Software Livre Tchelinux]: https://tchelinux.org
[https:/certificados.tchelinux.org]: https:/certificados.tchelinux.org
[repositório oficial]: https://github.com/tchelinux/certificados
[github]: https://github.com
[license]: LICENSE
