#config/deploy.rb

set :application, "rpi-ferment-frontend"

# see https://help.github.com/articles/deploying-with-capistrano
# on how to deploy with github and capistrano

set :repository, "https://github.com/sigsegv42/rpi-ferment-frontend.git"
ssh_options[:forward_agent] = true
set :scm, :git                                      #capper default

set :use_sudo, false                                #capper default
set :keep_releases, 5                               #capper default
set :deploy_via, :remote_cache                      #capper default
set :main_js, "lib/frontend.js"

# your log folder to share between different releases
# you can add more folders here...
set :symlinks, {"logs" => "lib/logs"}

desc "production stage"
task :production do
  set :use_nave, false
  set :branch, 'master'                                     #default
  set :user, 'rpi'

  set :deploy_to, "/www/rpi.quantumfish.com"     #capper defaults to "/var/app/#{application}"
  set :node_env, 'production'
  server 'quantumfish.com', :app                            #add more / different roles
  set :forever_cmd, "./node_modules/.bin/forever"           #use the forever that is installed along with the app
end

desc "tail the application logfile"
task :log do
  log = "#{application_dir}/current/logs/rpi-ferment-frontend.log"
  run "tail -f #{log}"
end