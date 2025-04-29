#include <iostream>
using namespace std;

const int MAX_STUDENTS = 100;

void waitForEnter() {

    cout << "Press Enter to continue...";
    cin.ignore();
    cin.get();
}

void addMarks(int marks[], int &count) {
    int n;
    cout << "Enter number of students to add marks for: ";
    cin >> n;

    for (int i = 0; i < n; ++i) {
        cout << "Enter marks for student " << (count + 1) << ": ";
        cin >> marks[count];
        ++count;
    }
}

void updateMarks(int marks[], int count) {
    int index, newMark;
    cout << "Enter student index to update (0 to " << count - 1 << "): ";
    cin >> index;

    if (index >= 0 && index < count) {
        cout << "Enter new mark: ";
        cin >> newMark;
        marks[index] = newMark;
        cout << "Mark updated successfully.\n";
    } else {
        cout << "Invalid index!\n";
    }
}

void searchMarks(int marks[], int count) {
    int searchMark;
    bool found = false;
    cout << "Enter mark to search: ";
    cin >> searchMark;

    for (int i = 0; i < count; ++i) {
        if (marks[i] == searchMark) {
            cout << "Mark " << searchMark << " found at index " << i << "\n";
            found = true;
        }
    }

    if (!found) {
        cout << "Mark not found.\n";
    }
}

void findMaxMin(int marks[], int count) {
    if (count == 0) {
        cout << "No marks entered yet.\n";
        return;
    }

    int maxMark = marks[0], minMark = marks[0];\
    
    for (int i = 1; i < count; ++i) {
        if (marks[i] > maxMark) maxMark = marks[i];
        if (marks[i] < minMark) minMark = marks[i];
    }

    cout << "Highest mark: " << maxMark << "\n";
    cout << "Lowest mark: " << minMark << "\n";
}

void displayMarks(int marks[], int count) {
    if (count == 0) {
        cout << "No marks to display.\n";
        return;
    }

    cout << "\n--- List of Student Marks ---\n";
    for (int i = 0; i < count; ++i) {
        cout << "Roll no. " << i+1 << ": " << marks[i] << "\n";
    }
}

int main() {
    int marks[MAX_STUDENTS];
    
    int count = 0;
    int choice;

    do {
        cout << "\n--- Student Marks Management ---\n";
        cout << "1. Add Marks\n";
        cout << "2. Update Marks\n";
        cout << "3. Search Marks\n";
        cout << "4. Find Highest & Lowest Marks\n";
        cout << "5. Display All Marks\n";  
        cout << "6. Exit\n";
        cout << "Enter your choice (1-6): ";
        cin >> choice;
        cin.ignore(); // clear newline after choice input

        switch (choice) {
            case 1: 
                addMarks(marks, count);
                waitForEnter();
                break;
            case 2: 
                updateMarks(marks, count);
                waitForEnter();
                break;
            case 3: 
                searchMarks(marks, count);
                waitForEnter();
                break;
            case 4: 
                findMaxMin(marks, count);
                waitForEnter();
                break;
            case 5:
                displayMarks(marks, count);
                waitForEnter();
                break;
            case 6: 
                cout << "Exiting program...\n";
                break;
            default: 
                cout << "Invalid choice!\n";
                waitForEnter();
                break;
        }

    } while (choice != 6);

    return 0;
}