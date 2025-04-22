#include <iostream>
using namespace std;

class Counter{
    protected:
    int count = 0;

    public:
    Counter(){
        count = 0;
    }
    
    Counter(int var){
        count  = var;
    }

    int operator++(){
        return ++count;
    }

    int operator--(){
        return --count;
    }

    void getCount(){
        cout<<count;
    }
};

class ArthCounter : public Counter{
    ArthCounter(int val = 0):Counter(val){};
    public:
    int operator*(){
        count = count * 2;
        return count;
    }

};

int main(){

    Counter c1;
    ++c1;
    *c1;
}