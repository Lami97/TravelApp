let globalPodaci = [];
let preuzmi = () => {
    //https://restapiexample.wrd.app.fit.ba/ -> Ispit20230715 -> GetPonuda

    let url = `https://wrd-fit.info/Ispit20240713/GetNovePonude`
    destinacije.innerHTML = '';//brisemo destinacije koje su hardkodirane (tj. nalaze se u HTML-u)
    fetch(url)
        .then(r => {
            if (r.status !== 200) {
                //greska
                return;
            }
            r.json().then(t => {

                let b = 0;
                globalPodaci = t.podaci //setujemo globalnu varijablu

                for (const x of t.podaci) {
                    destinacije.innerHTML += `
                    <article class="offer">
                        <div class="akcija">Polazak za <br>${x.naredniPolazak.zaDana} dana</div>
                        <div class="offer-image" style="background-image: url('${x.imageUrl}');" ></div>
                        <div class="offer-details">
                            <div class="offer-destination">${x.drzava}</div> 
                            <div class="offer-description">${x.opisPonude} ${x.opisPonude})}</div>    
                        </div>

                        <div class="offer-footer">
                            <div class="offer-info">
                                <div class="offer-price">
                                    ${x.naredniPolazak.cijenaPoOsobiEUR} €
                                </div>
                                <div class="offer-free">
                                    <span>
                                        Slobodno mjesta: ${x.naredniPolazak.brojSlobodnihMjesta}
                                    </span>
                                </div> 
                            </div>        
                            <div class="ponuda-dugme" onclick="K2_odaberiDestinaciju(${b})">K2 Pogledaj</div>
                        </div>
                    </article>
                    `
                    b++;
                }
            })
        })
}

preuzmi();

let K2_odaberiDestinaciju = (rbDrzave) => {

    let destinacijObj = globalPodaci[rbDrzave];


    let s = "";
    let rbPolaska = 0;
    for (const o of destinacijObj.planiranaPutovanja) {
        s += `
        <tr>
            <td>ID ${o.putovanjeId}</td>
            <td>${o.datumPolaska}</td>
            <td>${o.datumPovratka}</td>
            <td>${o.slobodnaMjestaCount}</td>
            <td>${o.brojDana}</td>
            <td>${o.cijenaPoOsobi} €</td>
            <td><button onclick="K3_odaberiPutovanje(${rbDrzave}, ${rbPolaska})">K3 Odaberi putovanje</button></td>
        </tr>`
        rbPolaska++;
    }
    putovanjaTabela.innerHTML = s;
}
let idPutovanja;

let K3_odaberiPutovanje = (rbDrzave, rbPutovanja) => {
    let destinacijObj = globalPodaci[rbDrzave];
    let putovanja = destinacijObj.planiranaPutovanja[rbPutovanja];
    drzavaText.value = destinacijObj.drzava;
    datumPolaska.value = putovanja.datumPolaska;
    cijenaPoGostu.value = putovanja.cijenaPoOsobi;


    idPutovanja=putovanja.putovanjeId;
    console.log("brPutovanja: " + rbPutovanja);
}
let getTempColor = (temp) => {
    if (temp >= 40)
        return 'red';
    if (temp < 40 && temp >= 30) {
        return 'rgb(235, 100, 52)'
    }
    if (temp < 30 && temp >= 20)
        return 'rgb(235, 134, 52)'
    if (temp < 20 && temp >= 10)
        return 'rgb(235, 211, 52)'
    if (temp < 10 && temp >= 0)
        return 'rgb(52, 235, 116)'
    if (temp < 0)
        return 'rgb(52, 58, 235)'
}


let ErrorBackgroundColor = "#FE7D7D";
let OkBackgroundColor = "#DFF6D8";

let posalji = () => {
    //https://wrd-fit.info/ -> Ispit20240907 -> Dodaj
    /*{
  "putovanje_ID": "string",
  "drzava_naziv": "string",
  "mobitel_telefon": "string",
  "datum_polaska": "string",
  "cijena_ukupno": 0,
  "gosti_putovanja": [
    "string"
  ],
  "broj_indeksa": "string",
  "email_adresa": "string",
  "datum_vazenja_pasosa": "string"
} */
    let greske="";
    //greske+= provjeriImePrezimeGostiju();
    greske+=provjeriPasos();
    greske+=provjeriEmail();
    greske+=provjeriBrojGostiju();
    if(greske !== ""){
        alert("Neispravni podaci!");
        return;
    }
    let imenaGostijuArray=Array.from(document.querySelectorAll("#gosti input")).map(x=>x.value);
    let n1 = 
            {
            "putovanje_ID": idPutovanja,
            "drzava_naziv": drzavaText.value,
            "mobitel_telefon": phone.value,
            "datum_polaska": datumPolaska.value,
            "cijena_ukupno": ukupnaCijena.value,
            "gosti_putovanja":imenaGostijuArray,
            "broj_indeksa": brojIndeksa.value,
            "email_adresa": email.value,
            "datum_vazenja_pasosa": datumVazenjaPasosa.value
            }
            ;

    


    let jsonString = JSON.stringify(n1);

    //console.log(jsObjekat);

    let url = "https://wrd-fit.info/Ispit20240907/Dodaj";

    //fetch tipa "POST" i saljemo "jsonString"
    fetch(url, {
        method: "POST",
        body: jsonString,
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(r => {
            if (r.status != 200) {
                alert("Greška")
                return;
            }

            r.json().then(t => {

                if (t.brojGresaka == 0) {
                    dialogSuccess(`Idi na placanje rezervacije broj ${t.idRezervacije} - iznos ${ukupnaCijena.value} EUR`, () => {
                        window.location = `https://www.paypal.com/cgi-bin/webscr?business=adil.joldic@yahoo.com&cmd=_xclick&currency_code=EUR&amount=${ukupnaCijena.value}&item_name=Dummy invoice`
                    });
                }
                else {
                    alert("greske: \n" + t.spisakGresaka.join('\n'));
                }
            })

        })
}


let promjenaBrojaGostiju = () => {
    let cijena = Number(cijenaPoGostu.value);
    let brojGostijuValue = Number(brojGostiju.value);
    let ukupno = (cijena * brojGostijuValue).toFixed(2);

    ukupnaCijena.value = ukupno;

    gosti.innerHTML = ``;
    for (let index = 0; index < brojGostijuValue; index++) {
        gosti.innerHTML += `<input type="text" oninput="provjeriImePrezimeGostiju()">`;

    }
}

let provjeriImePrezimeGostiju = () =>{
    
   
};
let provjeriTelefon = () => {
    let r = /^(?:\+387|0)6[1-9][0-9]{6}$/;
    if(!r.test(phone.value)){
        phone.style.backgroundColor = ErrorBackgroundColor;
        return "Neispravan unos";
    }
    else{
        phone.style.backgroundColor = OkBackgroundColor;
        return "";
    }

}

let provjeriBrojIndeksa = () => {
    let r = /^IB\d{2}\d{4}$/;
    if(!r.test(brojIndeksa.value)){
        brojIndeksa.style.backgroundColor = ErrorBackgroundColor;
        return "Neispravan unos";
    }
    else{
        brojIndeksa.style.backgroundColor = OkBackgroundColor;
        return "";
    }
}


let provjeriEmail = () => {
    let r = /^[a-zA-Z]+(?:\.[a-zA-Z]+)?@(fit\.ba|edu\.fit\.ba)$/;
    if(!r.test(email.value)){
        email.style.backgroundColor = ErrorBackgroundColor;
        return "Neispravan unos";
    }
    else{
        email.style.backgroundColor = OkBackgroundColor;
        return "";
    }
}


let provjeriPasos = () => {
    let r=/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d\d$/;
    if(!r.test(datumVazenjaPasosa.value)){
        datumVazenjaPasosa.style.backgroundColor = ErrorBackgroundColor;
        return "Neispravan unos";
    }
    else{
        datumVazenjaPasosa.style.backgroundColor = OkBackgroundColor;
        return "";
    }
}
let provjeriBrojGostiju =() =>{
    let r = /^[2-9]\d*$/;
    if(!r.test(brojGostiju.value)){
        brojGostiju.style.backgroundColor = ErrorBackgroundColor;
        return "Neispravan unos";
    }
    else{
        brojGostiju.style.backgroundColor = OkBackgroundColor;
        return "";
    }

}
