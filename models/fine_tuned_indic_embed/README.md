---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- dense
- generated_from_trainer
- dataset_size:300
- loss:MultipleNegativesRankingLoss
base_model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
widget:
- source_sentence: કેબેક ખાતે ફ્રેન્ચ દળોના કમાન્ડર કોણ હતા?
  sentences:
  - જનરલ મોન્ટક્લામ લુઈસ ક્વિબેકના યુદ્ધમાં ફ્રેન્ચ કમાન્ડર હતા.
  - કોર્ડોબા એ સ્પેનના આંદાલુસિયા પ્રદેશનો એક પ્રાંત છે. કોર્ડોબા, આંદાલુસિયા મેપકાર્ટાથી,
    આંતરક્રિયાત્મક નકશો.
  - કેપ્ટન એડી રિકનબેકર એક ભૂતપૂર્વ રેસ કાર ડ્રાઇવર હતા જેઓ પ્રથમ વિશ્વયુદ્ધના ટોચના
    અમેરિકન ફ્લાઇંગ એસ બન્યા હતા.
- source_sentence: મનાકિન શું છે?
  sentences:
  - અમને મહાન પરિણામો મળ્યા, પરંતુ કેટલાક મનાકિન સબોટની બહાર છે. મનાકિન સબોટથી 25
    માઇલની અંદર પરિણામો બતાવે છે.
  - 'સ્થાનિક કારકિર્દીઓ: ન્યૂયોર્કમાં તમામ નોકરીઓ શોધો. ન્યૂયોર્ક ન્યૂ યોર્કમાં નવી
    તકો શોધવા માટે તમારી હિમ ટેક નોકરી શોધને સુધારો.'
  - નામ બાયોંગ માટે; સંબંધિત નામો; ઉચ્ચારણ; અર્થ અને ઉદ્ભવ; મનોરંજક હકીકતો; આ પૃષ્ઠ
    પર શું બાયોંગ્સ મુલાકાત લીધી છે? નામ પોસ્ટર
- source_sentence: વિયર્ટનમાં કયું નગર છે
  sentences:
  - ઝડપી વર્ણનઃ વાયર્ટનનો ટાઉન હૉલ બ્રુસ દ્વીપકલ્પ પર સાઉથ બ્રુસ ટાઉનશીપ માટેની 'મ્યુનિસિપલ
    બિલ્ડિંગ' છે.
  - ટસ્કેગી એરમેનને તાલીમ આપનાર ફ્લાઇટ ઇન્સ્ટ્રક્ટર મિલ્ટન પિટ્સ ક્રેન્ચોનું જ્યોર્જિયામાં
    અવસાન થયું છે. તેઓ ૯૬ વર્ષના હતા.
  - વિન્ડોઝ લાઇવ ફોટો ગેલેરી 2012 એક ખૂબ જ સરળ એપ્લિકેશન છે જે તમને તમારા ફોટા જોવા
    અને મૂળભૂત સંપાદન કાર્યો કરવા દે છે. સંપૂર્ણ વર્ણન જુઓ
- source_sentence: ચોખ્ખો લાભ શું છે
  sentences:
  - નાથનના હોટ ડોગ્સ 11 ઓક્ટોબર, 2011 બાય સ્ટીવ ડન લીવ એ કોમેન્ટ ના, આ નાથનના વિશ્વપ્રખ્યાત
    નાથનના હોટ ડોગની તસવીર નથી. કોની આઇલેન્ડ, એનવાય.વાય. પરથી.
  - 'નેટ લાભનો અર્થ થઈ શકે છે: નેટ લાભ (દૂરસંચાર), ટ્રાન્સમિશન સર્કિટનો એકંદર લાભ.
    નેટ (અર્થશાસ્ત્ર) નેટ નફો; નેટ આવક.'
  - એડ્સ નામની ઉત્પત્તિ બ્રિટનની પ્રાચીન એંગ્લો-સેક્સન સંસ્કૃતિમાંથી થઈ છે. તે એડના
    પુત્ર પરથી એડિસન તરીકે ઉતરી આવ્યું છે, જે પાછળથી ટૂંકું થઈને એડી થયું હતું.
- source_sentence: કેન્ટકી નજીક કઈ કાઉન્ટી છે બેન્ટન
  sentences:
  - બોનીની મોટી મોડેલ ફાઇવ નાઇટ્સ એટ ફ્રેડીઝ 2માં ત્રણ અન્ય મોટી એનિમેટ્રોનિક્સ સાથે
    દેખાય છે જે તમામ ગંભીર નિષ્ફળતામાં પડી ગયા છે. તેની જગ્યાએ તેના નવા સમકક્ષ, ટોય
    બોની આવે છે.
  - બેન્ટન, માર્શલ કાઉન્ટી, કેન્ટકીઃ બેન્ટન, માર્શલ કાઉન્ટી, કેન્ટકીમાં વેચાણ માટે
    હજારો એકર જમીન શોધો.
  - 'સિંગ ફીચરટે - મીના. આ ફીચરટેમાં આપણે પ્રેમાળ અને શરમાળ મીના (ટોરી કેલી) વિશે
    વધુ જાણીએ છીએ. સિંગ 21 ડિસેમ્બર, 2016ના રોજ થિયેટરોમાં શરૂ થાય છે. વિડિયો કદ:'
pipeline_tag: sentence-similarity
library_name: sentence-transformers
---

# SentenceTransformer based on sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2). It maps inputs to a 384-dimensional dense vector space and can be used for semantic textual similarity, semantic search, paraphrase mining, classification, clustering, and more.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) <!-- at revision e8f8c211226b894fcb81acc59f3b34ba3efd5f42 -->
- **Maximum Sequence Length:** 128 tokens
- **Output Dimensionality:** 384 dimensions
- **Similarity Function:** Cosine Similarity
- **Supported Modality:** Text
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'transformer_task': 'feature-extraction', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'last_hidden_state'}}, 'module_output_name': 'token_embeddings', 'architecture': 'BertModel'})
  (1): Pooling({'embedding_dimension': 384, 'pooling_mode': 'mean', 'include_prompt': True})
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```
Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'કેન્ટકી નજીક કઈ કાઉન્ટી છે બેન્ટન',
    'બેન્ટન, માર્શલ કાઉન્ટી, કેન્ટકીઃ બેન્ટન, માર્શલ કાઉન્ટી, કેન્ટકીમાં વેચાણ માટે હજારો એકર જમીન શોધો.',
    'સિંગ ફીચરટે - મીના. આ ફીચરટેમાં આપણે પ્રેમાળ અને શરમાળ મીના (ટોરી કેલી) વિશે વધુ જાણીએ છીએ. સિંગ 21 ડિસેમ્બર, 2016ના રોજ થિયેટરોમાં શરૂ થાય છે. વિડિયો કદ:',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 384]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[1.0000, 0.6293, 0.1276],
#         [0.6293, 1.0000, 0.1855],
#         [0.1276, 0.1855, 1.0000]])
```
<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 300 training samples
* Columns: <code>sentence_0</code> and <code>sentence_1</code>
* Approximate statistics based on the first 100 samples:
  |          | sentence_0                                                                        | sentence_1                                                                          |
  |:---------|:----------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|
  | type     | string                                                                            | string                                                                              |
  | modality | text                                                                              | text                                                                                |
  | details  | <ul><li>min: 6 tokens</li><li>mean: 15.17 tokens</li><li>max: 29 tokens</li></ul> | <ul><li>min: 29 tokens</li><li>mean: 99.95 tokens</li><li>max: 128 tokens</li></ul> |
* Samples:
  | sentence_0                                         | sentence_1                                                                                                                                                                                                                                                                           |
  |:---------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>પતંગિયાની કેટલી પ્રજાતિઓ છે</code>           | <code>ઓસ્ટ્રેલિયન વસ્તુઓ પ્રત્યે ઉત્સાહી. વિશ્વમાં પતંગિયાની પ્રજાતિઓની સંખ્યાનો અંદાજ 15,000 અને 20,000ની વચ્ચે છે, જેમાંથી કેટલાક સ્રોતો 28,000 ટાંકે છે. દરેક સ્રોત માટે, નીચે સંબંધિત કડીઓ જુઓ.</code>                                                                           |
  | <code>કયા કદનું ફિલ્ટર ડીઝલ શેવાળને પકડે છે</code> | <code>બોલચાલની ભાષામાં ડીઝલ ઇંધણ શેવાળનો વ્યાપકપણે ઉપયોગ થાય છે અને તેને સમજવામાં આવે છે. જો કે, તમારા એક્વેરિયમમાં ઉગતા શેવાળ અને તમારા ઇંધણ ટાંકીમાં ઉગતા કાદવ અને તમારા ફિલ્ટર તત્વો પર દેખાતા શેવાળ વચ્ચે કોઈ સંબંધ નથી. ઇંધણ અને તેલમાં ચિંતાના ત્રણ મૂળભૂત ક્ષેત્રો છે.</code> |
  | <code>જેણે સૌથી વધુ ઓસ્કાર જીત્યા છે</code>        | <code>મૂનલાઇટ અને હિડન ફિગર્સમાં કેટલાક બ્રેકઆઉટ પરફોર્મન્સ ઉમેરો, અને અમે ટૂંક સમયમાં ટોચના ઓસ્કાર વિજેતા કેથરિન હેપબર્ન અને મેરિલ સ્ટ્રીપ સાથે વધુ નામોની અપેક્ષા રાખી શકીએ છીએ. સૌથી વધુ ઓસ્કાર વિજેતા અભિનેતાઓને જોવા માટે, નીચેની ગેલેરી પર ક્લિક કરો!</code>                   |
* Loss: [<code>MultipleNegativesRankingLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#multiplenegativesrankingloss) with these parameters:
  ```json
  {
      "scale": 20.0,
      "similarity_fct": "cos_sim",
      "gather_across_devices": false,
      "directions": [
          "query_to_doc"
      ],
      "partition_mode": "joint",
      "hardness_mode": null,
      "hardness_strength": 0.0
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `per_device_train_batch_size`: 16
- `num_train_epochs`: 2
- `per_device_eval_batch_size`: 16
- `multi_dataset_batch_sampler`: round_robin

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 16
- `num_train_epochs`: 2
- `max_steps`: -1
- `learning_rate`: 5e-05
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_steps`: 0
- `optim`: adamw_torch_fused
- `optim_args`: None
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `optim_target_modules`: None
- `gradient_accumulation_steps`: 1
- `average_tokens_across_devices`: True
- `max_grad_norm`: 1
- `label_smoothing_factor`: 0.0
- `bf16`: False
- `fp16`: False
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `use_cache`: False
- `neftune_noise_alpha`: None
- `torch_empty_cache_steps`: None
- `auto_find_batch_size`: False
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `include_num_input_tokens_seen`: no
- `log_level`: passive
- `log_level_replica`: warning
- `disable_tqdm`: False
- `project`: huggingface
- `trackio_space_id`: None
- `trackio_bucket_id`: None
- `trackio_static_space_id`: None
- `per_device_eval_batch_size`: 16
- `prediction_loss_only`: True
- `eval_on_start`: False
- `eval_do_concat_batches`: True
- `eval_use_gather_object`: False
- `eval_accumulation_steps`: None
- `include_for_metrics`: []
- `batch_eval_metrics`: False
- `save_only_model`: False
- `save_on_each_node`: False
- `enable_jit_checkpoint`: False
- `push_to_hub`: False
- `hub_private_repo`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_always_push`: False
- `hub_revision`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `restore_callback_states_from_checkpoint`: False
- `full_determinism`: False
- `seed`: 42
- `data_seed`: None
- `use_cpu`: False
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `dataloader_prefetch_factor`: None
- `dataloader_multiprocessing_context`: None
- `dataloader_in_order`: True
- `remove_unused_columns`: True
- `label_names`: None
- `train_sampling_strategy`: random
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `ddp_static_graph`: None
- `ddp_backend`: None
- `ddp_timeout`: 1800
- `fsdp`: None
- `fsdp_config`: None
- `deepspeed`: None
- `debug`: []
- `skip_memory_metrics`: True
- `do_predict`: False
- `resume_from_checkpoint`: None
- `local_rank`: -1
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: round_robin
- `router_mapping`: {}
- `learning_rate_mapping`: {}
- `warmup_ratio`: None

</details>

### Training Time
- **Training**: 13.7 seconds

### Framework Versions
- Python: 3.11.15
- Sentence Transformers: 6.0.0
- Transformers: 5.15.1
- PyTorch: 2.11.0+cu128
- Accelerate: 1.14.0
- Datasets: 5.0.1
- Tokenizers: 0.22.2

## Additional Resources

- [Training and Finetuning Embedding Models with Sentence Transformers](https://huggingface.co/blog/train-sentence-transformers): the end-to-end guide for training or finetuning Sentence Transformer models.
- [Introduction to Matryoshka Embedding Models](https://huggingface.co/blog/matryoshka): variable-size embeddings that can be truncated with minimal quality loss.
- [Binary and Scalar Embedding Quantization for Significantly Faster & Cheaper Retrieval](https://huggingface.co/blog/embedding-quantization): post-training compression of embedding vectors.
- [Multimodal Embedding & Reranker Models with Sentence Transformers](https://huggingface.co/blog/multimodal-sentence-transformers): use text, image, audio, and video models through the same API.
- [Training and Finetuning Multimodal Embedding & Reranker Models with Sentence Transformers](https://huggingface.co/blog/train-multimodal-sentence-transformers): train multimodal embedding models, with a Visual Document Retrieval walkthrough.

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

#### MultipleNegativesRankingLoss
```bibtex
@misc{oord2019representationlearningcontrastivepredictive,
      title={Representation Learning with Contrastive Predictive Coding},
      author={Aaron van den Oord and Yazhe Li and Oriol Vinyals},
      year={2019},
      eprint={1807.03748},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/1807.03748},
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

## Model Card Authors

- Dharmik Mistry ([@dmist08](https://github.com/dmist08))

## Model Card Contact

- GitHub: [https://github.com/dmist08/Dhwani-Indic-RAG](https://github.com/dmist08/Dhwani-Indic-RAG)
