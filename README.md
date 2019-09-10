# Bidit
###### Online Auction System, Project for Course `Web Application Technologies`
_This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8._

_[dev-run available](https://83.212.108.244:4200/ "~okeanos server")_

Contributors
------------

* [Sofia Kostakonti](https://github.com/sofiakstk/ "Sofia Kostakonti")
* [Ioannis Pelekoudas](https://github.com/pelekoudasq/ "Ioannis Pelekoudas")

System requirements
-------------------

* npm package manager

Installation & Testing
----------------------

```bash
git clone git://github.com/pelekoudasq/bidit.git
cd bidit
npm install -g
ng serve --ssl true --ssl-cert server.crt --ssl-key server.key
```
Then navigate to `https://localhost:4200/`

For auction's page map, clone [osm app](https://github.com/sofiakstk/osmapp "osm app") and run it elsewhere

Back end
--------

MongoDB w/ Node.js, Express, & Mongoose

```bash
node server run
```

Redis Caching
```bash
redis-server
```
