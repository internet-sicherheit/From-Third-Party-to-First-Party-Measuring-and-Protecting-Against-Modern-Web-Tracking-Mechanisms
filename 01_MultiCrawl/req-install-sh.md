
# SSH Commands:
sudo sed -i 's/http:\/\/eu-central-1.ec2.archive.ubuntu.com\/ubuntu\//https:\/\/mirror.de.leaseweb.net\/ubuntu\//g' /etc/apt/sources.list
sudo apt update && sudo apt upgrade -y
sudo apt install ubuntu-gnome-desktop -y
sudo hostnamectl set-hostname measurement_us_1 / measurement_us_2 / measurement_eu_1 / measurement_eu_2

# SSH Commands:
sudo apt update && sudo apt upgrade -y
sudo apt install ubuntu-gnome-desktop -y

sudo hostnamectl set-hostname measurement-filsterlists

sudo apt install xubuntu-desktop -y

sudo apt install ubuntu-gnome-desktop -y

mkdir tmp
cd tmp



wget https://www.c-nergy.be/downloads/xRDP/xrdp-installer-1.4.2.zip
unzip xrdp-installer-1.4.2.zip
chmod 777 xrdp-installer-1.4.2.sh
./xrdp-installer-1.4.2.sh
# -> 1 ubuntu


sudo su
passwd ubuntu 
***REMOVED***
exit


#miniforgeifis
curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
bash Miniforge3-$(uname)-$(uname -m).sh
# -> yes
 

sudo apt-get install make -y
sudo apt-get install git -y

mkdir ~/Desktop
cd ~/Desktop
mkdir server-side-tracking
cd server-side-tracking
wget https://ndemir.com/edu_drafts/2filterlists.zip
unzip server-side-tracking.zip






























## to be removed start
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
~/miniconda3/bin/conda init zsh
sudo apt-get install build-essential -y


curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Mambaforge-$(uname)-$(uname -m).sh"
bash Mambaforge-$(uname)-$(uname -m).sh

# to be removed end

sudo apt-get install make -y
sudo apt-get install git -y

mkdir ~/Desktop
cd ~/Desktop
mkdir filterlists
cd filterlists
wget https://ndemir.com/filterlists.zip
unzip filterlists.zip
git config --global credential.helper manager-core
git config --global credential.helper 'cache --timeout=3600000'
gsettings set org.gnome.desktop.screensaver lock-delay 3600
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.screensaver idle-activation-enabled false
git clean -df
git checkout -- .
git pull



chmod -R 777 *

sudo apt install build-essential -y

./install.sh

conda activate openwpm
pip install -r req-pip.txt
mkdir /home/ubuntu/openwpm
touch /home/ubuntu/openwpm/openwpm.log
sudo reboot

# sudo apt install software-properties-common apt-transport-https wget 
# wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
# sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" 
# sudo apt install code -y 
