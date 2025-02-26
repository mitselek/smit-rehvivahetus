# Proovitöö

Ülesande eesmärgiks on koostada sõidukite rehvivahetusaegade broneerimise rakendus. Rakendus kuvab kasutajale erinevate rehvivahetustöökodade vabu rehvivahetuse aegu ning võimaldab broneerida valitud ajaks rehvivahetuse.
Igal rehvitöökojal on oma rakendus, mis väljastab rehvivahetuse aegu ja võtab vastu vabadele aegadele tehtud broneeringuid. Loodav rakendus peab rehvivahetuste aegade pärimisel ja broneerimisel suhtlema rehvitöökodade rakendustega.

## Rehvitöökojad:

#### Manchester
Aadress: 14 Bury New Rd, Manchester
Teenindatavad sõiduki tüübid: Sõiduauto, Veoauto

#### London
Aadress: 1A Gunton Rd, London
Teenindatavad sõiduki tüübid: Sõiduauto

### Rehvivahetuse töökodade rakendused, API-liidestuse dokumentatsioon ja lähtekood asub aadressil https://github.com/Surmus/tire-change-workshop.
- docker run -d -p 9003:80 surmus/london-tire-workshop:2.0.1
- docker run -d -p 9004:80 surmus/manchester-tire-workshop:2.0.1

### Funktsionaalsed nõuded:
	•	Kasutaja peab saama rehvivahetuse aegu filtreerida:
	•	Rehvitöökodade järgi
	•	Ajavahemiku järgi
	•	Teenindatava sõiduki tüübi järgi
	•	Kasutaja peab saama vaba rehvivahetuse aega broneerida
	•	Kasutajale kuvatakse nimekiri vabadest rehvivahetusaegadest, kus peab saama välja lugeda:
	•	Töökoja nime
	•	Töökoja aadressi
	•	Rehvivahetuse aega
	•	Teenindatavate sõidukite tüüpe
	•	Kõik veaolukorrad peavad olema lahendatud ja kasutajale tuleb näidata adekvaatseid veateateid
	•	Rakenduses kuvatavaid rehvitöökodasid ja nende andmeid peaks saama hallata ilma koodi muutmata, näiteks läbi konfiguratsioonibloki

### Mittefunktsionaalsed nõuded:
	•	Lahendus peab välja nägema esinduslik
	•	Rakenduse arhitektuuri loomisel peaks arvestama võimalusega, et tulevikus võib rakendusse lisanduda veel rehvitöökodasid
	•	Suhtlus rehvitöökodade rakendustega peaks olema realiseeritud serveri poolel
	•	Rakenduse serveri pool peab olema lahendatud kasutades Pythoni tehnoloogiaid
	•	On lubatud, kuid ei ole kohustuslik kasutada mõnda laialdaselt levinud raamistikku
	•	Lahendamiseks kasutada Git repositooriumit (Github, Gitlab vms).

### Hindamise mõõdikud:
	•	Ülesande nõuetest kinni pidamine
	•	Koodi stiil, loetavus ja kvaliteet
	•	Kasutajaliidese ülesehitus ja disain
	•	Koodi ülesehituse loogilisus
	•	Tagarakenduse koodi kaetus testidega
