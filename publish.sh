sudo rm -rf build
tar -zxf build.tar.gz
sudo rm -rf /static-deployments/guard-duty/*
sudo cp -rf build/deploy/*  /static-deployments/guard-duty/
