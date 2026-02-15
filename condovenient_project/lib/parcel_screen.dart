import 'package:flutter/material.dart';

class ParcelScreen extends StatelessWidget {
  const ParcelScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('My Parcels')), // [cite: 175]
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Text(
            'Waiting for Pickup',
            style: TextStyle(fontWeight: FontWeight.bold),
          ), // [cite: 180]
          Card(
            child: ListTile(
              leading: Icon(Icons.inventory_2),
              title: Text('Kerry Express'), // [cite: 182]
              subtitle: Text('TH123456789'), // [cite: 183]
              trailing: Text('Waiting', style: TextStyle(color: Colors.orange)),
            ),
          ),
          SizedBox(height: 20),
          Text(
            'Collected',
            style: TextStyle(fontWeight: FontWeight.bold),
          ), // [cite: 181]
          Card(
            child: ListTile(
              leading: Icon(Icons.check_circle, color: Colors.green),
              title: Text('Thailand Post'), // [cite: 187]
              subtitle: Text('TH456789123'),
            ),
          ),
        ],
      ),
    );
  }
}
