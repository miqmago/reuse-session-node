#!/bin/bash
if test $# -ne 3
then
    echo "Wrong number of arguments"
    echo "Ussage: createCerts.sh ROOTPATH FQDN PASSWORD"
    echo "Example: createCerts.sh ./src localhost pAs$~w0rD"
    exit 1
fi

COUNTRY="AU"
CAO="CA Signing Authority"
SERVERO="Server cert"
CLIENTO="Client cert"

ROOTPATH="$1"
FQDN=$2
PASSWORD=$3
RSABITS=4096

# make directories to work from
rm -rf $ROOTPATH/certs/{server,client,ca,tmp}
mkdir -p $ROOTPATH/certs/{server,client,ca,tmp}

PATH_CA=$ROOTPATH/certs/ca
PATH_SERVER=$ROOTPATH/certs/server
PATH_CLIENT=$ROOTPATH/certs/client
PATH_TMP=$ROOTPATH/certs/tmp

######
# CA #
######

openssl genrsa -des3 -passout pass:$PASSWORD -out $PATH_CA/ca.key $RSABITS

# Create Authority Certificate
openssl req -new -x509 -days 365 -key $PATH_CA/ca.key -out $PATH_CA/ca.crt -passin pass:$PASSWORD -subj "/C=$COUNTRY/ST=./L=./O=$CAO/CN=."

##########
# SERVER #
##########

# Generate server key
openssl genrsa -out $PATH_SERVER/server.key $RSABITS

# Generate server cert
openssl req -new -key $PATH_SERVER/server.key -out $PATH_TMP/server.csr -passout pass:$PASSWORD -subj "/C=$COUNTRY/ST=./L=./O=$SERVERO/CN=$FQDN"

# Sign server cert with self-signed cert
openssl x509 -req -days 365 -passin pass:$PASSWORD -in $PATH_TMP/server.csr -CA $PATH_CA/ca.crt -CAkey $PATH_CA/ca.key -set_serial 01 -out $PATH_SERVER/server.crt

##########
# CLIENT #
##########

openssl genrsa -out $PATH_CLIENT/client.key $RSABITS

openssl req -new -key $PATH_CLIENT/client.key -out $PATH_TMP/client.csr -passout pass:$PASSWORD -subj "/C=$COUNTRY/ST=./L=./O=$CLIENTO/CN=CLIENT"

openssl x509 -req -days 365 -passin pass:$PASSWORD -in $PATH_TMP/client.csr -CA $PATH_CA/ca.crt -CAkey $PATH_CA/ca.key -set_serial 01 -out $PATH_CLIENT/client.crt

exit 0