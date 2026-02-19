let currentPage = 0;
const container = document.getElementById("container");

function mudarPagina(p){

    currentPage = p;
    container.style.transform = `translateX(-${p * 50}%)`;

    document.querySelectorAll(".tab").forEach((t,i)=>{
        t.classList.toggle("active",i===p);
    });

}

/* SWIPE */

let startX=0;

document.addEventListener("touchstart",e=>{
    startX=e.touches[0].clientX;
});

document.addEventListener("touchend",e=>{

    let endX=e.changedTouches[0].clientX;
    let diff=startX-endX;

    if(diff>50) mudarPagina(1);
    if(diff<-50) mudarPagina(0);

});


/* CAMPEONATO */

let times=[];
let stats={};


function gerar(){

    times=[
        t1.value||"Time A",
        t2.value||"Time B",
        t3.value||"Time C",
        t4.value||"Time D"
    ];

    criarStats();

    jogos.innerHTML=`
        ${rodada("Rodada 1",0,1,2,3)}
        ${rodada("Rodada 2",0,2,1,3)}
        ${rodada("Rodada 3",0,3,1,2)}
    `;

    atualizarTabela();
}


function criarStats(){

    stats={};

    times.forEach(t=>{
        stats[t]={
            pts:0,
            v:0,
            d:0,
            gp:0,
            gc:0,
            sg:0
        };
    });

}


function rodada(nome,a,b,c,d){

    return `
    <div class="rodada">
        <h3>${nome}</h3>
        ${jogo(times[a],times[b])}
        ${jogo(times[c],times[d])}
    </div>
    `;

}


function jogo(time1,time2){

    return `
    <div class="jogo" data-t1="${time1}" data-t2="${time2}">
        ${time1}
        <input type="number" min="0" onchange="salvarPlacar()">
        x
        <input type="number" min="0" onchange="salvarPlacar()">
        ${time2}
    </div>
    `;

}


function salvarPlacar(){

    criarStats();

    document.querySelectorAll(".jogo").forEach(jogo=>{

        let t1=jogo.dataset.t1;
        let t2=jogo.dataset.t2;

        let inputs=jogo.querySelectorAll("input");

        let g1=parseInt(inputs[0].value);
        let g2=parseInt(inputs[1].value);

        if(isNaN(g1)||isNaN(g2)) return;
        if(g1===g2) return; // sem empate

        stats[t1].gp+=g1;
        stats[t1].gc+=g2;

        stats[t2].gp+=g2;
        stats[t2].gc+=g1;

        stats[t1].sg=stats[t1].gp-stats[t1].gc;
        stats[t2].sg=stats[t2].gp-stats[t2].gc;

        if(g1>g2){
            stats[t1].pts+=3;
            stats[t1].v++;
            stats[t2].d++;
        }else{
            stats[t2].pts+=3;
            stats[t2].v++;
            stats[t1].d++;
        }

    });

    atualizarTabela();
}


function atualizarTabela(){

    let arr=Object.keys(stats).map(t=>({
        name:t,
        ...stats[t]
    }));

    arr.sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp);

    tabela.innerHTML="";

    arr.forEach(t=>{
        tabela.innerHTML+=`
        <tr>
            <td>${t.name}</td>
            <td>${t.pts}</td>
            <td>${t.v}</td>
            <td>${t.d}</td>
            <td>${t.gp}</td>
            <td>${t.gc}</td>
            <td>${t.sg}</td>
        </tr>
        `;
    });

    if(arr.length>=2){
        final.innerHTML=`🏆 Final: ${arr[0].name} vs ${arr[1].name}`;
    }

}


/* SALVAR CONFIGURAÇÃO */

function salvarConfig(){

    let dados={
        times:[
            t1.value,
            t2.value,
            t3.value,
            t4.value
        ],
        placares:[]
    };

    document.querySelectorAll(".jogo").forEach(jogo=>{

        let inputs=jogo.querySelectorAll("input");

        dados.placares.push([
            inputs[0].value,
            inputs[1].value
        ]);

    });

    localStorage.setItem("copaDados",JSON.stringify(dados));

    alert("Configuração salva!");
}


/* CARREGAR AUTOMATICAMENTE */

window.onload=()=>{

    let dados=localStorage.getItem("copaDados");

    if(!dados) return;

    dados=JSON.parse(dados);

    [t1.value,t2.value,t3.value,t4.value]=dados.times;

    gerar();

    setTimeout(()=>{

        let jogos=document.querySelectorAll(".jogo");

        dados.placares.forEach((p,i)=>{

            if(!jogos[i]) return;

            let inputs=jogos[i].querySelectorAll("input");

            inputs[0].value=p[0];
            inputs[1].value=p[1];

        });

        salvarPlacar();

    },200);

};
