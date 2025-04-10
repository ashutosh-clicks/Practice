#include <iostream>
using namespace std;

class Number{
    int value;

    public:
    Number(int v ){
        value = v;
    }

    friend Number operator+(Number a, Number b);

};



int main() {
    Number n1(10), n2(20);
    Number result = n1 + n2;  // Calls the overloaded + operator
    result.show();            // Output: Value: 30
    return 0;
}

