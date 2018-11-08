#!/usr/bin/env bash

set -e

# Must be run as someone with DB admin powers, e.g. the postgres user

psql -c "CREATE USER \"slumbr-test\" WITH PASSWORD 'slumbr-test';" -U postgres
psql -c "CREATE DATABASE \"slumbr-test\" WITH OWNER 'slumbr-test';" -U postgres
psql -c 'CREATE EXTENSION "uuid-ossp";' -U postgres -d slumbr-test