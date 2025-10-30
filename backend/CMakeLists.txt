cmake_minimum_required(VERSION 3.10)

project(Backend)

find_package(Crow REQUIRED)
find_package(cpr REQUIRED)

add_executable(Backend main.cpp)

target_link_libraries(Backend PUBLIC Crow::Crow cpr::cpr)
