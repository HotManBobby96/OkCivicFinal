FROM ubuntu:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    wget \
    pkg-config \
    libasio-dev \
    libboost-all-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install latest CMake
RUN apt-get purge --auto-remove -y cmake || true
RUN wget https://github.com/Kitware/CMake/releases/download/v3.28.3/cmake-3.28.3-linux-x86_64.sh
RUN bash cmake-3.28.3-linux-x86_64.sh --skip-license --prefix=/usr/local
ENV PATH="/usr/local/bin:${PATH}"
RUN cmake --version

#cpr im going to kill my self
RUN git clone https://github.com/libcpr/cpr.git /cpr
WORKDIR /cpr
RUN apt-get update && apt-get install -y meson ninja-build
RUN mkdir build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release -DCPR_USE_SYSTEM_CURL=ON && make -j$(nproc) && make install


# Build Crow
RUN git clone https://github.com/CrowCpp/Crow.git /Crow
WORKDIR /Crow/build
RUN cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF
RUN make -j$(nproc) install

# Build your app
WORKDIR /app
COPY . .
RUN mkdir build && cd build && cmake .. && make -j$(nproc)

ENV PORT=8080
EXPOSE 8080

WORKDIR /app/build
CMD ["./Backend"]
