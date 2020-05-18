import time
from elasticsearch import Elasticsearch

from tokenizer import Token 
from sentence_transformers import SentenceTransformer


class SimiSearch:
    def __init__(self):
        self.es = Elasticsearch(maxsize=1000)
        self.tk = Token()
        self.bc = SentenceTransformer('bert-base-nli-mean-tokens')
        
    def findSimQuestions(self, q: str, topk: int, minScore=0.7):
        """
        Find similar questions based on cosine similarity to a question q and return top k results
        Params:
        q: question that needs searching for similar questions
        topk: nb of top results returned
        """
        
        tks = self.tk.tokenize([q])
        embedding_start = time.time()
        
        query_vector = self.bc.encode(tks)
           
        query_vector = query_vector[0].tolist()
        embedding_time = time.time() - embedding_start

        script_query = {
            "script_score": {
                "query": {
                    "multi_match": {
                        "query": q,
                        "type": "bool_prefix",
                        "fields": [
                            "text",
                            "text._2gram",
                            "text._3gram"
                        ]
                    }
                },
                "script": {
                    "source": "return cosineSimilarity(params.query_vector, 'vectorisation');",
                    "params": {
                        "query_vector": query_vector
                    }
                },
                "min_score": minScore
            }
        }

        print('encoding time: {}'.format(embedding_time))

        search_start = time.time()
        response = self.es.search(
            index='qa',
            body={
                "size": topk,
                "query": script_query,
                "_source": ['id', 'text']
            }
        )

        search_time = time.time() - search_start
        print('search time: {}'.format(search_time))

        res = []
        for r in response['hits']['hits'][:topk]:
            res.append([r['_source']['id'], r['_source']['text'], r['_score']])
        return res
    

if __name__ == '__main__':
    sim = SimiSearch()
    while True:
        query = input('Enter your question:\n')
        print(sim.findSimQuestions(query, 5))