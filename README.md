setup

./frontend 

    bash

    npm install (install dependcies)

./backend

    bash

    wsl.exe --install (installs wsl)

    wsl.exe --list --online (To check distros (optional))

    wsl.exe --install Ubuntu

    wsl.exe --set-default-version 2

    install docker https://www.docker.com/

    Everything should be running with WSL 
    to check or if your getting errors run

    wsl.exe -l -v

    you should see 
      NAME              STATE           VERSION
        Ubuntu            Stopped         2
        docker-desktop    Stopped         2

Server Running

./frontend

    bash

    npx vite

        Open the local link it gives

./backend

    bash

    docker build -t imageName .

    docker run -p 8080:8080 imageName 

testing

    if you cant call the API's and are getting errors, check the cpp file

        ./backend/main.cpp

            in a editor add the api keys.

                - google civic api

                - 5calls api

                - congress.gov api


The Inital repo got messed up. I forgot to configure .env and dont want those things on the internet 

congressional app challenge 2025

Logan Bruner, Nathan Wooden, and Bryson Blakney.
