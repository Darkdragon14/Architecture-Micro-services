# Architecture-Micro-services
An architecture micro-services powered by Docker

To launch this project you need :
* [ansible](https://www.ansible.com)
* [vagrant](https://www.vagrantup.com)

And to run the system just use :
```bash
vagrant up
```

Data from [thegamedb.com](http://thegamesdb.net) and stocked in the bdd [neo4j](https://neo4j.com). The data is display by an interface and to access this juste [localhost:8081](localhost:8081) for an extern access. For finish we have a reverse proxy with caching. 
The monitoring is with [Traefik](https://traefik.io) and the system for autoscaling is a deamon in NodeJs that ask Treafik and request [Orbiter](https://github.com/gianarb/orbiter). 