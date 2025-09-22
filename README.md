## Nest Chavito
### Instruções para subir com Docker, inserir dados e testar

Resumo rápido:
 este projeto usa Docker (Postgres + app Nest). O docker-compose.yml define dois serviços: db (Postgres) e app (aplicação Nest). A API fica em http://localhost:3000 e o banco em localhost:5432 (usuário/senha: chavito/chavito).

  para o Swagger:

  http://localhost:3000/api#/

 ## Pré-requisitos

Docker (e Docker Compose integrado) instalado.

(Opcional) psql local para checar o banco, curl ou Postman para testar endpoints.

* 1 - Preparar o ambiente

No diretório raiz do projeto (onde está o docker-compose.yml):

Verifique se existe .env. Se não houver, crie a partir do exemplo:
```
cp .env.example .env
```
O .env padrão contém (valores usados pelo compose):
```
DB_TYPE=postgres
POSTGRES_USER=chavito
POSTGRES_PASSWORD=chavito
POSTGRES_DB=chavito
DB_HOST=db
DB_PORT=5432
DB_USERNAME=chavito
DB_PASSWORD=chavito
DB_DATABASE=chavito
```
OBS: Ajuste se necessário (por exemplo portas).

* 2 - Subir containers (Docker Compose)

No terminal, a partir da raiz do projeto:
```
# Com Docker Compose v2 (recomendado)
docker compose up --build -d

# Ou com docker-compose (versões antigas)
docker-compose up --build -d

```
Verifique status:
```
docker compose ps
```

Acompanhe logs da aplicação (aguarde até ver que a aplicação iniciou ou até as migrations rodarem):

```
docker compose logs -f app
```

* 3 - Rodar migrations (se necessário)

O docker-compose já executa npm run migration:run na inicialização do app (conforme docker-compose.yml). Se quiser rodar manualmente depois que o container estiver UP:
```
docker compose exec app npm run migration:run

```
* 4 - Inserir dados no banco (seed)
Há duas formas, sendo a recomendada a de usar o script de seed ts-node já presente no projeto.

Recomendado (rodar script TypeScript de seed dentro do container app):
```
docker compose exec app npm run seed
```

Esse script (src/seeds/seeds.ts) conecta via TypeORM ao banco e insere registros iniciais (departamentos, títulos, professores, etc). Ao final ele imprime Seed executado com sucesso! quando bem sucedido.

Alternativa (usar o arquivo SQL):

O projeto também contém src/seeds/seed.sql. Para aplicar esse SQL diretamente no container do banco você pode (exemplo usando cat e canalizando para o psql do container db):

```
# Exemplo: envia o SQL do container 'app' para o psql do container 'db'
docker compose exec -T app cat src/seeds/seed.sql | docker compose exec -T db psql -U chavito -d chavito

````
Obs: a forma acima assume que os arquivos do projeto estão montados em /usr/src/app dentro do container app — isto é verdade no docker-compose.yml do projeto.

* 5 - Como verificar os dados diretamente no banco

Se tiver psql instalado localmente:
```
# Linux/Mac
PGPASSWORD=chavito psql -h localhost -p 5432 -U chavito -d chavito -c "SELECT id, name FROM department;"

# No Windows PowerShell
$env:PGPASSWORD="chavito"; psql -h localhost -p 5432 -U chavito -d chavito -c "SELECT id, name FROM department;"
```
Ou usando psql dentro do container do banco:

```
docker compose exec db psql -U chavito -d chavito -c "SELECT id, name FROM department;"

```
* 6 - Testar a API

A aplicação expõe endpoints REST para testar recursos (exemplos abaixo usam curl):

Teste se a aplicação está no ar (root):
```
curl -i http://localhost:3000/
# Deve retornar "Hello World!" no body

```
Listar todos os  buildings:
```
curl http://localhost:3000/buildings
````
Criar um building (exemplo):
```
curl -X POST http://localhost:3000/buildings \
  -H "Content-Type: application/json" \
  -d '{"name":"Bloco A"}'

```
Listar subjects:
```
curl http://localhost:3000/subjects
```
Criar um subject (exemplo — conforme DTO do projeto):
```
curl -X POST http://localhost:3000/subjects \
  -H "Content-Type: application/json" \
  -d '{"subject_id":"MAT101","code":"MAT101","name":"Matemática I"}'

```

Relatórios disponíveis (exemplos):

Horas por professor:
```
curl http://localhost:3000/reports/hours-per-professor

```

Agenda das salas:
```
curl http://localhost:3000/reports/rooms-schedule

```
Observação: além dos endpoints acima, o projeto possui controllers REST para rooms, class, professors, departments, titles etc. Use GET /<resource> e POST /<resource> conforme DTOs em src/modules/*/dto.

* 7 - Rodar testes automatizados
```
docker compose exec app npm test

```
Se preferir rodar localmente, instale dependências (npm install) e execute npm test localmente (assegure que o .env aponte para um banco disponível).

* 8 - Parar e remover containers / volumes

```
# Para e remove containers (e redes)
docker compose down

# Para e remove containers + volumes (remove volume do Postgres => perde dados)
docker compose down -v

```
## Resumo rápido de comandos
```
# 1. Subir containers
docker compose up --build -d

# 2. Ver logs da app
docker compose logs -f app

# 3. Rodar seed (inserir dados)
docker compose exec app npm run seed

# 4. Testar API (exemplos)
curl http://localhost:3000/
curl http://localhost:3000/buildings
curl -X POST http://localhost:3000/buildings -H "Content-Type: application/json" -d '{"name":"Bloco A"}'

# 5. Rodar testes
docker compose exec app npm test

# 6. Parar e remover (opcional)
docker compose down -v
```