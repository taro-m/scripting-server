#!/bin/sh

curl -i -X PUT "http://127.0.0.1:8080/scripts" --data-binary @"$1"
