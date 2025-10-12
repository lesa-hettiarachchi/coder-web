import { EscapeRoomStage } from '@/types/escapeRoom';

export const escapeRoomQuestionBank: Omit<EscapeRoomStage, 'id'>[] = [
  // Easy Questions (1-7)
  {
    title: "Format the Code",
    description: "Fix the indentation and formatting of this Python code:",
    starterCode: `def calculate_sum(numbers):
sum = 0
for num in numbers:
sum += num
return sum
result = calculate_sum([1,2,3,4,5])
print(result)`,
    solution: `def calculate_sum(numbers):
    sum = 0
    for num in numbers:
        sum += num
    return sum

result = calculate_sum([1,2,3,4,5])
print(result)`,
    hint: "Add proper indentation (4 spaces) and spacing around operators",
    difficulty: "easy",
    points: 125,
    isActive: true
  },
  {
    title: "Generate Numbers",
    description: "Write code to generate all numbers from 0 to 1000:",
    starterCode: `# Write your code here to generate numbers 0 to 1000
`,
    solution: `for i in range(1001):
    print(i)`,
    hint: "Use a for loop with range(). Remember range(1001) goes from 0 to 1000.",
    difficulty: "easy",
    points: 125,
    isActive: true
  },
  {
    title: "Simple Calculator",
    description: "Create a function that adds two numbers:",
    starterCode: `# Create a function called add_numbers that takes two parameters and returns their sum
# Then call it with 5 and 3`,
    solution: `def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)
print(result)`,
    hint: "Define a function with 'def', use 'return' to give back the result",
    difficulty: "easy",
    points: 100,
    isActive: true
  },
  {
    title: "Print Pattern",
    description: "Print a simple pattern of stars:",
    starterCode: `# Print this pattern:
# *
# **
# ***
# ****`,
    solution: `for i in range(1, 5):
    print("*" * i)`,
    hint: "Use a loop and string multiplication with '*'",
    difficulty: "easy",
    points: 100,
    isActive: true
  },
  {
    title: "Find Maximum",
    description: "Find the largest number in a list:",
    starterCode: `numbers = [3, 7, 2, 9, 1, 5]
# Find and print the maximum number`,
    solution: `numbers = [3, 7, 2, 9, 1, 5]
print(max(numbers))`,
    hint: "Python has a built-in max() function for lists",
    difficulty: "easy",
    points: 100,
    isActive: true
  },
  {
    title: "Count Characters",
    description: "Count how many times 'a' appears in a string:",
    starterCode: `text = "programming is amazing"
# Count and print how many times 'a' appears`,
    solution: `text = "programming is amazing"
count = text.count('a')
print(count)`,
    hint: "Use the count() method on strings",
    difficulty: "easy",
    points: 100,
    isActive: true
  },
  {
    title: "Reverse String",
    description: "Reverse a string and print it:",
    starterCode: `word = "hello"
# Reverse the string and print it`,
    solution: `word = "hello"
reversed_word = word[::-1]
print(reversed_word)`,
    hint: "Use string slicing with [::-1] to reverse",
    difficulty: "easy",
    points: 100,
    isActive: true
  },

  // Medium Questions (8-14)
  {
    title: "Debug the Code",
    description: "Find and fix the bug in this code:",
    starterCode: `def find_maximum(arr):
    max_val = 0
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

print(find_maximum([5, 3, 9, 1, 7]))`,
    solution: `def find_maximum(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

print(find_maximum([5, 3, 9, 1, 7]))`,
    hint: "What if the array contains negative numbers? Initialize max_val with the first element.",
    difficulty: "medium",
    points: 175,
    isActive: true
  },
  {
    title: "Fibonacci Sequence",
    description: "Generate the first 10 numbers in the Fibonacci sequence:",
    starterCode: `# Generate first 10 Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34`,
    solution: `a, b = 0, 1
for i in range(10):
    print(a)
    a, b = b, a + b`,
    hint: "Start with 0 and 1, then each number is the sum of the two previous numbers",
    difficulty: "medium",
    points: 175,
    isActive: true
  },
  {
    title: "Prime Number Check",
    description: "Check if a number is prime:",
    starterCode: `def is_prime(n):
    # Check if n is prime
    # Return True if prime, False otherwise
    pass

print(is_prime(17))  # Should print True
print(is_prime(15))  # Should print False`,
    solution: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(17))  # Should print True
print(is_prime(15))  # Should print False`,
    hint: "Check if any number from 2 to sqrt(n) divides n evenly",
    difficulty: "medium",
    points: 175,
    isActive: true
  },
  {
    title: "List Comprehension",
    description: "Use list comprehension to create a list of squares:",
    starterCode: `numbers = [1, 2, 3, 4, 5]
# Create a list of squares using list comprehension`,
    solution: `numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(squares)`,
    hint: "List comprehension syntax: [expression for item in iterable]",
    difficulty: "medium",
    points: 150,
    isActive: true
  },
  {
    title: "Dictionary Operations",
    description: "Create a dictionary and find the key with maximum value:",
    starterCode: `scores = {"Alice": 85, "Bob": 92, "Charlie": 78, "Diana": 96}
# Find the student with the highest score`,
    solution: `scores = {"Alice": 85, "Bob": 92, "Charlie": 78, "Diana": 96}
max_student = max(scores, key=scores.get)
print(max_student)`,
    hint: "Use max() with key parameter to find the key with maximum value",
    difficulty: "medium",
    points: 150,
    isActive: true
  },
  {
    title: "String Manipulation",
    description: "Capitalize the first letter of each word in a sentence:",
    starterCode: `sentence = "hello world python programming"
# Capitalize first letter of each word`,
    solution: `sentence = "hello world python programming"
result = sentence.title()
print(result)`,
    hint: "Use the title() method to capitalize first letter of each word",
    difficulty: "medium",
    points: 150,
    isActive: true
  },
  {
    title: "File Reading",
    description: "Read and count lines in a multi-line string:",
    starterCode: `text = """Line 1
Line 2
Line 3
Line 4"""
# Count the number of lines`,
    solution: `text = """Line 1
Line 2
Line 3
Line 4"""
lines = text.strip().split('\n')
print(len(lines))`,
    hint: "Split by newline character and count the resulting list",
    difficulty: "medium",
    points: 150,
    isActive: true
  },

  // Hard Questions (15-20)
  {
    title: "Data Conversion",
    description: "Convert this CSV data to JSON format:",
    starterCode: `# Convert CSV to JSON
csv_data = """name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Tokyo"""

# Write your conversion code here`,
    solution: `csv_data = """name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Tokyo"""

lines = csv_data.strip().split('\n')
headers = lines[0].split(',')
result = []

for line in lines[1:]:
    values = line.split(',')
    obj = {}
    for i in range(len(headers)):
        obj[headers[i]] = values[i]
    result.append(obj)

print(result)`,
    hint: "Split by newlines, extract headers, then create dictionaries for each row.",
    difficulty: "hard",
    points: 225,
    isActive: true
  },
  {
    title: "Sorting Algorithm",
    description: "Implement bubble sort to sort a list:",
    starterCode: `def bubble_sort(arr):
    # Implement bubble sort algorithm
    # Sort the array in ascending order
    pass

numbers = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(numbers)
print(numbers)`,
    solution: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

numbers = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(numbers)
print(numbers)`,
    hint: "Compare adjacent elements and swap if they're in wrong order. Repeat until sorted.",
    difficulty: "hard",
    points: 225,
    isActive: true
  },
  {
    title: "Recursive Function",
    description: "Implement factorial using recursion:",
    starterCode: `def factorial(n):
    # Implement factorial using recursion
    # factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
    pass

print(factorial(5))`,
    solution: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    hint: "Base case: factorial(1) = 1, recursive case: factorial(n) = n * factorial(n-1)",
    difficulty: "hard",
    points: 200,
    isActive: true
  },
  {
    title: "Binary Search",
    description: "Implement binary search to find an element:",
    starterCode: `def binary_search(arr, target):
    # Implement binary search
    # Return index if found, -1 if not found
    pass

sorted_list = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(sorted_list, 7))  # Should print 3
print(binary_search(sorted_list, 6))  # Should print -1`,
    solution: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

sorted_list = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(sorted_list, 7))  # Should print 3
print(binary_search(sorted_list, 6))  # Should print -1`,
    hint: "Compare target with middle element, eliminate half the search space each time",
    difficulty: "hard",
    points: 250,
    isActive: true
  },
  {
    title: "Regular Expression",
    description: "Extract email addresses from text using regex:",
    starterCode: `import re

text = "Contact us at john@example.com or support@company.org for help"
# Extract all email addresses using regex`,
    solution: `import re

text = "Contact us at john@example.com or support@company.org for help"
emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
print(emails)`,
    hint: "Use re.findall() with email pattern regex: \\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
    difficulty: "hard",
    points: 200,
    isActive: true
  },
  {
    title: "Class Implementation",
    description: "Create a BankAccount class with deposit and withdraw methods:",
    starterCode: `class BankAccount:
    def __init__(self, initial_balance=0):
        # Initialize with initial_balance
        pass
    
    def deposit(self, amount):
        # Add amount to balance
        pass
    
    def withdraw(self, amount):
        # Subtract amount from balance (don't allow negative balance)
        pass
    
    def get_balance(self):
        # Return current balance
        pass

# Test the class
account = BankAccount(100)
account.deposit(50)
account.withdraw(30)
print(account.get_balance())  # Should print 120`,
    solution: `class BankAccount:
    def __init__(self, initial_balance=0):
        self.balance = initial_balance
    
    def deposit(self, amount):
        self.balance += amount
    
    def withdraw(self, amount):
        if self.balance >= amount:
            self.balance -= amount
        else:
            print("Insufficient funds")
    
    def get_balance(self):
        return self.balance

# Test the class
account = BankAccount(100)
account.deposit(50)
account.withdraw(30)
print(account.get_balance())  # Should print 120`,
    hint: "Use self.balance to store the balance, check for sufficient funds before withdrawing",
    difficulty: "hard",
    points: 250,
    isActive: true
  }
];
