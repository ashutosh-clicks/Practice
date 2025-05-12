#include <iostream>
using namespace std;

class Node{
    public:
    int data;
    Node* right;
    Node* left;

    Node(int data){
        this->data = data;
        right = NULL;
        left = NULL;
    }

    void preOrder(Node* root){
        if(root == NULL){
            return;
        }
        cout<<root->data<<endl;
        preOrder(root->left);
        preOrder(root->right);
    }

    void inOrder(Node* root){
        if(root == NULL){
            return;
        }
        inOrder(root->left);
        cout<<root->data<<endl;
        inOrder(root->right);
    }

    void postOrder(Node* root){
        if(root == NULL){return;}
        postOrder(root->left);
        postOrder(root->right);
        cout<<root->data<<endl;
    }
};


int main(){
    Node *n1 = new Node(10);
    Node *n2 = new Node(20);
    Node *n3 = new Node(30);
    Node *n4 = new Node(40);
    Node *n5 = new Node(50);
    Node *n6 = new Node(60);    
    Node *n7 = new Node(70);
    n1->right=n3;n1->left=n2;
    n2->right=n5;n2->left=n4;
    n3->right=n7;n3->left=n6;
    Node *root = n1;

    // n1->preOrder(root);
    // n1->inOrder(root);
    n1->postOrder(root);

}