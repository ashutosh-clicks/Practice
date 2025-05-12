#include <iostream>
using namespace std;

int const cap = 5;
int stack[cap];
int top = -1;

void print(){
    for(int i = top;i>=0;i--){
        cout<<stack[i]<<endl;
    }
}
void push(int x){
    top++;
    stack[top] = x;
}

void pop(){
    cout<<"Popped: "<<stack[top]<<endl;
    top--;
}

void peek(){
    cout<<"Peeked: "<<stack[top]<<endl;
}

bool isEmpty(){
    if(top == -1){
        return true;
    }
    return false;
}



int main(){
    push(5);
    push(4);
    pop();
    push(4);
    peek();
    // cout<<"Size of stack is: "<<size();
    print();
}