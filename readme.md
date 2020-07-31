# Bob Interface

(Below are the instructions for Ubuntu and WSL2)
## Prerequisites

* Make sure to dispose yourself of all the __credentials files__ of AWS, Azure and the db

* Installing Anaconda is recommended before following the instructions

* Installing `libpq-dev` on your machine 

* Have a running elasticsearch service in background (a very good tutorial is [here](https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-elastic-stack-on-ubuntu-18-04), you don't have to finish all the steps listed, just installing elasticsearch suffices). Start and verify with commands:

```bash
sudo service elasticsearch start
sudo service elasticsearch status
```

## Instructions

* Cloning this repository

* Copy all credentials folders into the source folder

* Installing all required python packages with: `pip install -r nlp/requirements.txt`

* Installing all required npm packages with: `npm i`

* Indexing all questions to your elasticsearch service with: `python nlp/indexing_questions.py`

## Run the program

* On one terminal, type: `npm start`

* Open another terminal, type `python nlp/qa-server.py`

* Please launch the RASA server in parallel [](https://github.com/The-AI-Institute-Bob/bob-rasa-v2). You only need RASA NLU

* Go to `https://localhost:5000/?exercice=1&user=3113` to see results (pay attention to the existence of query params)

Before launching the program, make sure to have elasticsearch already running in background (see final lines of _prequisites_ part)

* Run all the tests with `npm test`






