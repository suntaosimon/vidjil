#!/bin/bash

. ./build-generic.sh

MY_PWD="$PWD"

source_files="../doc ../README.org ../reports ../server ../tools"
dest_files="server/vidjil-server"
exec_dir="server"

copy_files -s="$source_files" -d="$dest_files"

cd "$MY_PWD/$exec_dir"
create_version_file "$MY_PWD/$dest_files/server"
bash "$MY_PWD/mkdeb"

cd "$MY_PWD"

remove_files -s="$source_files" -d="$dest_files"
exit 0
