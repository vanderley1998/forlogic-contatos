import Paginacao from './paginacao'
import Eventos from './eventos'
import Filtro from './filtro'
import API from './api'
import ElementosDOM from './elementosDOM'
//SVGs
import favFullSvg from '../img/baseline-favorite-24px.svg'
import favBorderSvg from '../img/baseline-favorite_border-24px.svg'
import avatarSvg from '../img/round-person-24px.svg'

const Contatos = {

    listaContatos: {},
    listaPesquisa: {},

    //Buscar contatos pelo nome
    buscarContatos(nome) {
        Paginacao.redefinir()
        Contatos.listaPesquisa = Contatos.listaContatos.filter(e => {
            const nomeCompleto = `${e.firstName} ${e.lastName}`
            if (nomeCompleto.includes(nome)) {
                return e
            }
        })
        Contatos.init(Contatos.listaPesquisa)
    },

    //Favoritar o contato
    async favoritar(element, status) {
        if (status != undefined) {
            const contato = Contatos.listaContatos.filter(e => {
                if (element.getAttribute('wm-id') == e.id) {
                    return e
                }
            })[0]

            if (contato) {
                contato.isFavorite = status
                const res = await API.updateContato(contato)
                if (res) {
                    const flag = (element.parentNode.parentNode.getAttribute('wm-favorito')) ? false : true
                    if (flag) {
                        element.src = favFullSvg
                        element.title = 'Desfavoritar'
                        element.parentNode.parentNode.setAttribute('wm-favorito', 'true')
                    } else {
                        element.src = favBorderSvg
                        element.title = 'Favoritar'
                        element.parentNode.parentNode.removeAttribute('wm-favorito')
                    }
                } else {
                    const msg = 'Não foi possível alterar o status de favorito do contato!'
                    alert(msg)
                    throw msg
                }
            } else {
                throw 'Erro. Contato não encontrado'
            }
        } else {
            throw 'Erro. É necessário passar um status de favorito para o contato'
        }

    },

    //Deletar contato
    async deletarContato() {
        const iIdContato = ElementosDOM.iIdContato.value
        if (iIdContato && confirm('Deseja realmente deletar este contato?')) {
            const resp = await API.deleteContato(iIdContato)
            if (resp) {
                for (let i = 0; i < Contatos.listaContatos.length; i++) {
                    if (Contatos.listaContatos[i].id == iIdContato) {
                        delete Contatos.listaContatos[i]
                    }
                }
                Contatos.init(Contatos.listaContatos)
                Contatos.limparFormulario()
            }
        }
    },

    //Criar novo contato
    async criarNovoContato() {
        const formDados = {
            firstName: ElementosDOM.iNome.value,
            lastName: ElementosDOM.iSobrenome.value,
            email: ElementosDOM.iEmail.value,
            gender: (ElementosDOM.iFeminino.checked == true) ? 'f' : 'm',
            isFavorite: false,
            company: ElementosDOM.iCompanhia.value,
            avatar: ElementosDOM.iAvatar.value,
            address: ElementosDOM.iEndereco.value,
            phone: ElementosDOM.iTelefone.value,
            comments: ElementosDOM.tComentario.value
        }
        const resp = await API.createContato(formDados)
        if (resp) {
            Contatos.init()
            Contatos.limparFormulario()
            alert('Contato salvo com sucesso!')
        }
    },

    //Vefiricar se o cantato está favoritado e alterar icone de acordo.
    estaFavoritado(flag) {
        if (flag) {
            return favFullSvg
        } else {
            return favBorderSvg
        }
    },

    //Renderizar os contatos na DOM
    renderizarContatos(data, callback, paginaAtual, limitItens) {

        ElementosDOM.lista_itens.innerHTML = ''

        Paginacao.totalPaginas = Math.ceil(data.length / limitItens);
        let count = (paginaAtual * limitItens) - limitItens;
        let delimitador = count + limitItens;

        if (paginaAtual <= Paginacao.totalPaginas) {
            Paginacao.habilitarBotoes(true)
            for (let i = count; i < delimitador; i++) {
                if (data[i] != null) {
                    const a = document.createElement('a')
                    a.onclick = () => {
                        Contatos.renderizarDetalhes(data[i].id)
                        if (window.innerWidth <= 700) {
                            Contatos.openModal()
                        }
                    }

                    const li = document.createElement('li')
                    li.setAttribute('class', 'item_contato')

                    const icon = document.createElement('img')
                    icon.setAttribute('src', data[i].info.avatar)
                    icon.setAttribute('alt', 'Icone de contato')

                    const nome = document.createElement('div')
                    nome.setAttribute('class', 'nome_contato')
                    nome.innerText = `${data[i].firstName} ${data[i].lastName}`

                    const fav = document.createElement('img')
                    fav.setAttribute('class', 'fav')
                    fav.setAttribute('src', Contatos.estaFavoritado(data[i].isFavorite))
                    fav.setAttribute('wm-id', data[i].id)
                    if (data[i].isFavorite) {
                        a.setAttribute('wm-favorito', 'true')
                        fav.setAttribute('alt', 'Icone de favoritado')
                        fav.setAttribute('title', 'Desfavoritar')
                    } else {
                        fav.setAttribute('alt', 'Icone de desfavoritar')
                        fav.setAttribute('title', 'Favoritar')
                    }

                    li.append(icon)
                    li.append(nome)
                    li.append(fav)
                    a.append(li)

                    ElementosDOM.lista_itens.append(a)
                }
            }
            if (callback) {
                callback()
            }
        }
    },

    //Exibir detalhes do contato a partir do ID
    renderizarDetalhes(id) {
        Contatos.listaContatos.filter(e => {
            if (e.id == id) {
                ElementosDOM.buttonFechar.style.display = 'flex'
                ElementosDOM.iIdContato.value = e.id
                ElementosDOM.avatar.src = e.info.avatar
                ElementosDOM.iNome.value = e.firstName
                ElementosDOM.iSobrenome.value = e.lastName
                ElementosDOM.iEmail.value = e.email
                if (e.gender == 'f') {
                    ElementosDOM.iFeminino.checked = true
                } else {
                    ElementosDOM.iMasculino.checked = true
                }
                ElementosDOM.iAvatar.value = e.info.avatar
                ElementosDOM.iCompanhia.value = e.info.company
                ElementosDOM.iEndereco.value = e.info.address
                ElementosDOM.iTelefone.value = e.info.phone
                ElementosDOM.tComentario.value = e.info.comments
                ElementosDOM.bRemover.style.display = 'flex'
            }
        })
    },

    //Abrir modal
    openModal() {
        ElementosDOM.detalhes_contato.style.display = 'flex'
    },

    //Limpar o formulário do cadastro
    limparFormulario() {
        if (window.innerWidth <= 700) {
            ElementosDOM.detalhes_contato.removeAttribute('style')
        } else {
            ElementosDOM.buttonFechar.removeAttribute('style')
        }
        ElementosDOM.bRemover.removeAttribute('style')
        ElementosDOM.avatar.src = avatarSvg
        ElementosDOM.iIdContato.removeAttribute('value')
        ElementosDOM.formCadastro.reset()
    },

    //Validar o formulário de cadastro
    validarFormulario() {
        
    },

    //Faz requisição, renderiza e atribui eventos aos contatos
    async init(resultados) {
        if (resultados) {
            Paginacao.redefinir()
            Contatos.renderizarContatos(resultados, Eventos.init, Paginacao.paginaAtual, 10)
        } else {
            if (Filtro.filtroSelecionado() == 'fTodos') {
                Contatos.listaContatos = await API.getContatos()
            } else {
                Contatos.listaContatos = await API.getContatosFavoritos()
            }
            Contatos.renderizarContatos(Contatos.listaContatos, Eventos.init, Paginacao.paginaAtual, 10)
        }
    }

}

export default Contatos