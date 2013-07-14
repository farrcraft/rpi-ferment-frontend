#config/deploy.rb

set :application, "rpi-ferment-frontend"

# see https://help.github.com/articles/deploying-with-capistrano
# on how to deploy with github and capistrano

set :repository, "git@github.com:sigsegv42/rpi-ferment-frontend.git"
ssh_options[:forward_agent] = true
set :scm, :git                                      #capper default

set :use_sudo, false                                #capper default
set :keep_releases, 5                               #capper default
set :deploy_via, :remote_cache                      #capper default
set :main_js, "build/your_app.js"

# your log folder to share between different releases
# you can add more folders here...
set :symlinks, {"log" => "log"}

# We use two different stages here production / staging
desc "production stage"
task :production do
# skip using nave on production server
  set :use_nave, false
  set :branch, 'master'                                     #default
  set :user, 'your_app_user'

  set :deploy_to, , "/home/#{user}/deploy/#{application}"   #capper defaults to "/var/app/#{application}"
  set :node_env, 'production'
  server 'quantumfish.com', :app                            #add more / different roles
  set :forever_cmd, "./node_modules/.bin/forever"           #use the forever that is installed along with the app
end

desc "staging stage"
task :staging do
# use node 0.8.1. together with nave
  set :node_ver, '0.8.1'

# test a different branch on staging  
  set :branch, 'node-0.8'
  set :user, 'your_app_user'
  set :deploy_to, "/home/#{user}/deploy/#{application}"
  set :node_env, 'staging'
  server 'your.stage.server', :app
  set :forever_cmd, "./node_modules/.bin/forever"
end

desc "tail the application logfile"
task :log do
  log = "#{application_dir}/current/log/#{node_env}.log"
  run "tail -f #{log}"
end