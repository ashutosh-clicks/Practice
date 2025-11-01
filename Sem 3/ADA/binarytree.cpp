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
};

void inorder(Node* root){
    if(root == NULL) return;
    inorder(root->left);
    cout<<root->data<<" ";
    inorder(root->right);
}


void preorder(Node* root){
    if(root == NULL) return;
    cout<<root->data;
    preorder(root->left);
    preorder(root->right);
}

void postorder(Node* root){
    if(root == NULL) return ;
    preorder(root->left);
    preorder(root->right);
    cout<<root->data;
}


int main(){
Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);

    cout << "Inorder: "; inorder(root); cout << endl;
    cout << "Preorder: "; preorder(root); cout << endl;
    cout << "Postorder: "; postorder(root); cout << endl;


}