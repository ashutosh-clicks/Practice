#include <iostream>
using namespace std;


void fibonacci(int n){
    int n1 =0 ,n2 = 1;
    cout<<n1<<endl;
    for(int i= 1; i< n; i++){
        cout<<n2<<endl;
        int next = n1+n2;
        n1 = n2;
        n2 = next;
    }
}

int main(){
    int n = 10;
    fibonacci(n);


    return 0;
}