from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class ChatBot:
    def __init__(self):
        self.model_name = "gpt2"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
    def generate_response(self, user_input, max_length=100):
        if not user_input.strip():
            return "Please provide a valid input."
            
        # Tokenize with attention mask
        inputs = self.tokenizer(
            user_input,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length
        )
        
        # Generate response
        outputs = self.model.generate(
            inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_length=max_length,
            num_return_sequences=1,
            no_repeat_ngram_size=2,
            pad_token_id=self.tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response

def main():
    chatbot = ChatBot()
    print("ChatBot initialized. Type 'quit' to exit.")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break
        
        response = chatbot.generate_response(user_input)
        print(f"Bot: {response}")

if __name__ == "__main__":
    main()