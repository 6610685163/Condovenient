import 'package:flutter/material.dart';

class RepairScreen extends StatelessWidget {
  const RepairScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('New Repair Request')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(labelText: 'Problem Description'),
            ), // [source 149]
            TextField(
              decoration: InputDecoration(labelText: 'Location'),
            ), // [source 161]
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Submit Request'), // [source 166]
            ),
          ],
        ),
      ),
    );
  }
}
