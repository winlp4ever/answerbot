# How to setup GitHub Actions on a repository

## Connect to the VM
First of all, you'll need to start an SSH connection to the GitHub Actions VM on AWS.
To do that, download the <code> githubActions.pem </code> and <code>production.pem</code> files containing the RSA private key to your work directory.<br>
Then, run<br>
- For test machine :<br><code>
sudo ssh -i "githubActions.pem" ubuntu@ec2-35-180-101-149.eu-west-3.compute.amazonaws.com
</code><br>
- For prod machine :<br><code>
sudo ssh -i "production.pem" ubuntu@ec2-35-181-43-72.eu-west-3.compute.amazonaws.com
</code><br>

## tmux
Different terminal sessions are opened on this VM. Each runs a JobListener for a specific GitHub Actions setup corresponding to a repository. The rule is :
<br>1 repo = 1 GitHub Actions = 1 JobListener = 1 tmux session<br><br>
You can check these different sessions using <code>tmux ls</code>.
When creating a new GitHub actions config, you'll have to add a terminal session (or tmux session) by using<br>
<code>
tmux new -s NAME_OF_REPO
</code><br>
Then you can attach to a tmux terminal by using
<code>
  tmux attach -t NAME_OF_REPO
</code>

## Setting up the JobListener
On GitHub, go to your repository, and browse into <code>Settings->Actions</code>. Under the section "Self-hosted runners", click on "Add runner" and follow the instructions. Run the commands in the tmux session you've just opened.

## Detaching from tmux
You need to detach from the <code>tmux</code> window without stopping the execution of the job listener. The easiest way to do this is to <code>CTRL + b</code> and then type <code>d</code>.

## Setup the jobs
Now your JobListener should be running on the VM you've just created, and GitHub is ready to send Jobs once you configure them.<br>
In GitHub, go to your repository and browse into the <code>Actions</code> tab. There, choose between the different prebuilt options, or click on "setup a workflow yourself". It will create a YAML file in the <code>.github/workflows</code> directory.<br>
In there, you can configure the different steps of your CI workflow. Each language and each purpose leads to a different road here so it's up to you to find out how to achieve your goal from there.

Writer : Nathan
