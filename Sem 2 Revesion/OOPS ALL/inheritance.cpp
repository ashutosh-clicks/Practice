#include <iostream>
using namespace std;

class Animal {
public:
    void eat() { cout << "Eating...\n"; }
};

class Dog :virtual public Animal {
public:
    void bark() { cout << "Barking...\n"; }
};

class Cat :virtual public Animal{
    public:
        void meow(){cout<<"Meowing"<<endl;}
};

class Fourlegs :public Dog, public Cat{
    public:
        void walk(){cout<<"Walking"<<endl;}
};


int main(){
    Fourlegs f1;
    f1.eat();
    f1.bark();
    f1.meow();
    f1.walk();
}