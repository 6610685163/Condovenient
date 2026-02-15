import 'package:flutter/material.dart';

class VisitorScreen extends StatelessWidget {
  const VisitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Register Visitor')), // [cite: 364]
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(labelText: 'Visitor Name'),
            ), // [cite: 365]
            TextField(
              decoration: InputDecoration(
                labelText: 'Car Plate (e.g., 1AB-9999)',
              ),
            ), // [cite: 366]
            TextField(
              decoration: InputDecoration(labelText: 'Date (YYYY-MM-DD)'),
            ), // [cite: 367]
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Save'),
            ), // [cite: 368]
          ],
        ),
      ),
    );
  }
}
