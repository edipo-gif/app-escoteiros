// Service worker: permite instalar o app e usá-lo sem internet (ex.: no acampamento).
// Estratégia "rede primeiro": com internet, sempre pega a versão mais nova do GitHub;
// sem internet, usa a cópia salva no celular.
const CACHE = 'sentinelas-v2';
const ARQUIVOS = [
    './',
    './index.html',
    './manifest.json',
    './pdf-lib.min.js',
    './autorizacao_atividade.pdf',
    './img/logo-escoteiros-do-brasil.png',
    './img/emblema-sentinelas.png',
    './img/icone-192.png',
    './img/icone-512.png',
    './img/apple-touch-icon.png'
];

self.addEventListener('install', evento => {
    evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS)));
    self.skipWaiting();
});

self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys().then(nomes => Promise.all(
            nomes.filter(nome => nome !== CACHE).map(nome => caches.delete(nome))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', evento => {
    const req = evento.request;
    // Só guarda arquivos do próprio app (a busca de CEP sempre vai para a internet)
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

    // cache: 'no-cache' faz o celular sempre conferir com o GitHub se há versão nova
    // (sem isso, o navegador pode mostrar a versão antiga por até 10 minutos)
    evento.respondWith(
        fetch(req, { cache: 'no-cache' })
            .then(resposta => {
                const copia = resposta.clone();
                caches.open(CACHE).then(cache => cache.put(req, copia));
                return resposta;
            })
            .catch(() => caches.match(req, { ignoreSearch: true }))
    );
});
