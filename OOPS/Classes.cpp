#include <iostream>
#include<cmath>
using namespace std;

class Student{
    private:
    string name;
    int roll_no,marks;

    public:

    void input(string n, int r,int m){
        name = n;
        roll_no = r;
        marks = m;
    }

    void display(){
        cout<<"Name: "<<name<<endl;
        cout<<"Roll No.: "<<roll_no<<endl;
        cout<<"Marks: "<<marks<<endl;
    }


};

class Rectangle{
    private:
    float width,height;

    public:
    Rectangle(int w ,int h){
        width = w;
        height = h;
    }
    void area(){
        float area = width*height;
        cout<<area;
    }
};

class Book{
    private:
    string title;
    int price = 0;

    public:

    Book(){
        title = "NAN";
        price = 0;
    }

    Book(string title){
        this->title = title;
        price = 0;
    }

    Book(string title, int price){
        this->title = title;
        this->price = price;
    }

    void input(){
        cout<<"Title: ";
        cin>>title;
        cout<<"Price: ";
        cin>>price;
        // Book *newBook = new Book(title, price);
    }

    void display(){
        cout<<"Title: "<<title<<endl;
        cout<<"Price: "<<price<<endl;
    }

};

class BankAccount{
    private:
    int accountNo, balance;

    public:

    BankAccount(){

    }

    void setter(){
        accountNo = 0;
        balance = 0;
        cout<<"Account Number: ";
        cin>>accountNo;
        cout<<"Balance: ";
        cin>>balance;

    }

    void setter(int a,int b){
        accountNo = a;
        balance = b;
    }

    void getter(){
        cout<<"Account Number: "<<accountNo<<endl;
        cout<<"Balance: "<<balance<<endl;
    }

    void withdraw(){
        int amount;
        cout<<"Amount to withdraw from account "<<accountNo<<": ";
        cin>>amount;
        if(amount > balance){
            "Insufficient Balance";
        }
        else{
            balance = balance-amount;
        }
        getter();
    }

};

class Person{
    protected:
    string person;
    int age;

    
    public:
    Person(){
        person = "NAN";
        age = 0;
    }
    Person(string p ,int a){
        person = p;
        age = a;
    }
};

class Employee:public Person{
    private:
    int empid,salary;

    public:
        Employee(string p , int a, int e, int s):Person(p,a){
        empid = e;
        salary = s;
    }

    void display(){
        cout<<"Name: "<<Person::person<<endl;
        cout<<"ID: "<<empid<<endl;
        cout<<"Age: "<<Person::age<<endl;
        cout<<"Salary: "<<salary<<endl;
    }
    
};

class Math{
    public:
    int sum;

    Math(int s){
        sum = s;
    }

    friend Math operator+(Math a, Math b);
    
    
    void display(){
        cout<<sum;
    }

};


Math operator+(Math a, Math b){
    // cout<<pow(2,3);
    return Math(pow(a.sum,b.sum));
}

int main(){
    // Student s1;;
    // s1.input("Ashutosh",1,30);
    // s1.display();

    // Rectangle *r1 = new Rectangle(10,20);
    // r1->area();

    
    // Book *b1 = new Book();
    // b1->input();
    // b1->display();

    // BankAccount ba1,ba2,ba3;
    // ba1.setter(1,200);
    // ba2.setter(2,7000);
    // ba3.setter(3,2100);
    // ba1.withdraw();

    // Employee *e1 = new Employee("Ashutosh",18,1001,9999999);
    // e1->display();

    Math m1(2),m2(5);
    Math result = m1+m2;
    result.display();

    return 0;

}