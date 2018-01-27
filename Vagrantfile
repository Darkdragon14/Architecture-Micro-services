manager_ip = "52.47.75.66"

Vagrant.configure(2) do |config|
 
  config.vm.define "master" do |manager|
    manager.vm.hostname = "master"
    manager.vm.box = "ubuntu/xenial64"
    manager.vm.network "private_network", ip: manager_ip
 
    manager.vm.provider :virtualbox do |v|
      v.cpus = 1
      v.memory = 2048
    end
    manager.vm.provision "ansible" do |ansible|
      ansible.playbook = "manager.yml"
      ansible.extra_vars = {
          ansible_python_interpreter: "/usr/bin/python3",
          manager_ip: manager_ip
      }
    end
  end
 

    config.vm.define "slave-1" do |worker|
      worker.vm.hostname = "slave-1"
      worker.vm.box = "ubuntu/xenial64"
      worker.vm.network "private_network", ip: "52.47.166.117"
 
      worker.vm.provider :virtualbox do |v|
        v.cpus = 1
        v.memory = 2048
      end
      worker.vm.provision "ansible" do |ansible|
        ansible.playbook = "worker.yml"
        ansible.extra_vars = {
            ansible_python_interpreter: "/usr/bin/python3",
            manager_ip: manager_ip
        }
      end
    end
 
end
