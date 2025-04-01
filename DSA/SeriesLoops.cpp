#include <iostream>
#include<vector>
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


void arrsum(int arr[],int size, int target){
    int f = 0;
    int l = size-1;
    for(int i =0; i<size;i++){
        if(arr[f]+arr[l]!= target){
            if(arr[f]+arr[i]>target){
                l--;
            }
            else{
                f++;
            }
            cout<<"Naaah"<<endl;
        }
        if(arr[f]+arr[l]==target){
            cout<<f<<" "<<l<<" "<<target;
            break;
        }
    }
}


void arrsumfromtoindex(int arr[],int size,int target){
    int sum = 0;
    int f = 0;
    int i = 0;
    for(int i = 0;i<size;++i){
        sum = sum+i;
        while(sum>target && f<=i){
        sum = sum-arr[f];
            f++;
        }
        if(sum == target){
            cout<<f<<" "<<i-1;
        }
    }
}


int main(){
    // fibonacci(10);
    //arrsum(arr,size,7);
    // arrsumfromtoindex(arr,size,12);
    int arr[6] = {1,2,3,4,5};
    int size = sizeof(arr)/sizeof(arr[0]);
    

    return 0;
}