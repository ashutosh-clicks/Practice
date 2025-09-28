#include <iostream>
using namespace std;



struct MinMax
{
    int min;
    int max;
};


MinMax DACminmax(int *arr,int start,int end){
    MinMax left,right,result;
    if(start == end){
        result.min = result.max =  arr[start];
        return result;
    }

    if(end == start+1){
        if(arr[start] > arr[end]){
            result.min = arr[end];
            result.max = arr[start];
        }
        else{
            result.min = arr[start];
            result.max = arr[end];
        }
    }

    int mid = (start +end)/2;
    left = DACminmax(arr,start,mid);
    right = DACminmax(arr,mid+1,end);

    result.min = (left.min < right.min)?left.min:right.min;
    result.max = (left.max > right.max)?left.max:right.max;

    return result;
}




int factorial(int a){
    if(a!=1){
        int sum = a*factorial(a-1);
    }
    else{return 1;}
}

void  straightMinMax(){
    int arr[10] = {1,2,6,7,8,3,4,5,10,9};
    int min = arr[0];
    int max = arr[0];

    for(int i = 0; i<10; i++){
        if(arr[i]>max){
            max = arr[i];
        }
        else if(arr[i]<min){
            min = arr[i];

        }
    }
    cout<<max<<endl;
    cout<<min;
}

long expo(long n, long p){
    long ans = 1;
    while(p>0){
        if(p%2 == 1){
            ans = ans*n;
        }
        n = n*n;
        p = p/2;
    }
    return ans;
    
}



int main(){

    


    return 0;

}
