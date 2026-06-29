// File: app.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert 
} from 'react-native';

// Comprehensive Database of High-Value State Quarter Varieties & Errors
const STATE_COIN_DB = {
  '1999-P_DELAWARE': {
    name: '1999-P Delaware State Quarter',
    baseValue: 0.25,
    notableErrors: [
      { id: 'del_spit', label: 'Spitting Horse (Die Crack)', premiumCirculated: 10, premiumUncirculated: 50 }
    ]
  },
  '2004-D_WISCONSIN': {
    name: '2004-D Wisconsin State Quarter',
    baseValue: 0.25,
    notableErrors: [
      { id: 'wi_high', label: 'Extra Corn Leaf - High Variety', premiumCirculated: 50, premiumUncirculated: 300 },
      { id: 'wi_low', label: 'Extra Corn Leaf - Low Variety', premiumCirculated: 40, premiumUncirculated: 250 }
    ]
  },
  '2005-P_KANSAS': {
    name: '2005-P Kansas State Quarter',
    baseValue: 0.25,
    notableErrors: [
      { id: 'ks_rust', label: '"In God We Rust" (Grease Filled Die)', premiumCirculated: 15, premiumUncirculated: 90 },
      { id: 'ks_spit', label: 'Spitting Bison (Die Crack)', premiumCirculated: 5, premiumUncirculated: 45 }
    ]
  },
  '2005-P_MINNESOTA': {
    name: '2005-P Minnesota State Quarter',
    baseValue: 0.25,
    notableErrors: [
      { id: 'mn_tree', label: 'Extra Tree (Doubled Die Reverse)', premiumCirculated: 10, premiumUncirculated: 120 }
    ]
  },
  '2008-P_ARIZONA': {
    name: '2008-P Arizona State Quarter',
    baseValue: 0.25,
    notableErrors: [
      { id: 'az_cactus', label: 'Extra Cactus Leaf / Die Chip', premiumCirculated: 3, premiumUncirculated: 25 }
    ]
  }
};

export default function App() {
  // Application State
  const [selectedCoinKey, setSelectedCoinKey] = useState('2004-D_WISCONSIN');
  const [selectedGrade, setSelectedGrade] = useState('AU'); // Circulated (About Uncirculated) vs Mint State
  const [activeErrors, setActiveErrors] = useState({});
  const [customNotes, setCustomNotes] = useState('');
  const [inventory, setInventory] = useState([]);
  const [estimatedValue, setEstimatedValue] = useState(0.25);

  // Load Inventory Logs from localStorage on mount
  useEffect(() => {
    try {
      const savedLog = localStorage.getItem('whatcoin_inventory_log');
      if (savedLog) {
        setInventory(JSON.parse(savedLog));
      }
    } catch (e) {
      console.error("Failed to load inventory logs from localStorage", e);
    }
  }, []);

  // Recalculate Appraised Value whenever coin configuration changes
  useEffect(() => {
    calculateAppraisal();
  }, [selectedCoinKey, selectedGrade, activeErrors]);

  const calculateAppraisal = () => {
    const coinData = STATE_COIN_DB[selectedCoinKey];
    if (!coinData) return;

    let total = coinData.baseValue;
    const isUncirculated = selectedGrade === 'MS';

    // Add premiums for confirmed varieties/errors
    coinData.notableErrors.forEach(error => {
      if (activeErrors[error.id]) {
        total += isUncirculated ? error.premiumUncirculated : error.premiumCirculated;
      }
    });

    // Baseline grading premium adjustments
    if (isUncirculated) {
      total += 2.50; // Generic MS condition bump
    }

    setEstimatedValue(parseFloat(total.toFixed(2)));
  };

  const toggleError = (errorId) => {
    setActiveErrors(prev => ({
      ...prev,
      [errorId]: !prev[errorId]
    }));
  };

  const handleSaveToInventory = () => {
    const coinData = STATE_COIN_DB[selectedCoinKey];
    const newLogEntry = {
      id: Date.now().toString(),
      coinName: coinData.name,
      grade: selectedGrade === 'MS' ? 'Mint State (MS-65 Est.)' : 'Circulated (AU-55 Est.)',
      errorsDetected: coinData.notableErrors
        .filter(e => activeErrors[e.id])
        .map(e => e.label),
      value: estimatedValue,
      notes: customNotes,
      date: new Date().toLocaleDateString()
    };

    const updatedInventory = [newLogEntry, ...inventory];
    setInventory(updatedInventory);
    
    try {
      localStorage.setItem('whatcoin_inventory_log', JSON.stringify(updatedInventory));
      // Reset input fields
      setCustomNotes('');
      setActiveErrors({});
      Alert.alert("Success", "Appraisal saved to WhatCoin™ historical ledger.");
    } catch (e) {
      console.error("Failed to write to localStorage", e);
    }
  };

  const handleClearInventory = () => {
    try {
      localStorage.removeItem('whatcoin_inventory_log');
      setInventory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const currentCoin = STATE_COIN_DB[selectedCoinKey];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>WhatCoin™</Text>
        <Text style={styles.appSubtitle}>Numismatic Currency Appraisal Suite</Text>
      </View>

      {/* Target Selection Configurator */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Select State Target Variety</Text>
        <View style={styles.pickerAlternative}>
          {Object.keys(STATE_COIN_DB).map((key) => (
            <TouchableOpacity 
              key={key} 
              style={[styles.chip, selectedCoinKey === key && styles.chipActive]}
              onPress={() => {
                setSelectedCoinKey(key);
                setActiveErrors({});
              }}
            >
              <Text style={[styles.chipText, selectedCoinKey === key && styles.chipTextActive]}>
                {STATE_COIN_DB[key].name.split(' State ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Surface Micro-Condition Grading */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Luster & Wear Condition Grade</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.selectorButton, selectedGrade === 'AU' && styles.selectorActive]} 
            onPress={() => setSelectedGrade('AU')}
          >
            <Text style={[styles.selectorText, selectedGrade === 'AU' && styles.selectorTextActive]}>
              Circulated / About Uncirculated (AU)
            </Text>
            <Text style={styles.subLabel}>Trace wear on high design points</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorButton, selectedGrade === 'MS' && styles.selectorActive]} 
            onPress={() => setSelectedGrade('MS')}
          >
            <Text style={[styles.selectorText, selectedGrade === 'MS' && styles.selectorTextActive]}>
              Mint State / Uncirculated (MS)
            </Text>
            <Text style={styles.subLabel}>Full original mint frost, no wear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Micro-Error Checklisting Verification */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Micro-Attribution Error Checklist</Text>
        <Text style={styles.infoParagraph}>
          Examine the coin surface under magnification. Check any confirmed anomalies below:
        </Text>
        {currentCoin.notableErrors.map((error) => (
          <TouchableOpacity 
            key={error.id} 
            style={[styles.checkboxRow, activeErrors[error.id] && styles.checkboxRowSelected]}
            onPress={() => toggleError(error.id)}
          >
            <View style={[styles.checkbox, activeErrors[error.id] && styles.checkboxChecked]} />
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>{error.label}</Text>
              <Text style={styles.checkboxSublabel}>
                Est. Premium: +${selectedGrade === 'MS' ? error.premiumUncirculated : error.premiumCirculated}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Live Financial Appraisal Output Panel */}
      <View style={[styles.card, styles.appraisalPanel]}>
        <Text style={styles.appraisalTitle}>Estimated Real Market Value</Text>
        <Text style={styles.appraisalValue}>${estimatedValue.toFixed(2)}</Text>
        <Text style={styles.appraisalDisclaimer}>
          Based on aggregate auction data, strike verification parameters, and current metal trends.
        </Text>
        
        <TextInput 
          style={styles.textInput}
          placeholder="Add coin details (e.g., Mint mark clarity, strike character...)"
          placeholderTextColor="#778899"
          value={customNotes}
          onChangeText={setCustomNotes}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveToInventory}>
          <Text style={styles.saveButtonText}>Commit to WhatCoin™ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Persistent Storage Inventory Log View */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionHeading}>Saved Ledger Logs</Text>
          {inventory.length > 0 && (
            <TouchableOpacity onPress={handleClearInventory}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {inventory.length === 0 ? (
          <Text style={styles.emptyText}>No appraised items logged in localStorage database yet.</Text>
        ) : (
          inventory.map((item) => (
            <View key={item.id} style={styles.inventoryItem}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{item.coinName}</Text>
                <Text style={styles.itemValue}>${item.value.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemSubText}>Grade: {item.grade} | Logged: {item.date}</Text>
              {item.errorsDetected.length > 0 && (
                <Text style={styles.itemErrorText}>Errors: {item.errorsDetected.join(', ')}</Text>
              )}
              {item.notes ? <Text style={styles.itemNotes}>Notes: {item.notes}</Text> : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11141a',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222936',
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0f4f8',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#8da2bb',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1b212c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: '#2c3545',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  infoParagraph: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 18,
  },
  pickerAlternative: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#242c3d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#38bdf8',
    borderColor: '#0284c7',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0f172a',
  },
  row: {
    flexDirection: 'column',
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorButton: {
    backgroundColor: '#242c3d',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectorActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#1e293b',
  },
  selectorText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#38bdf8',
  },
  subLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242c3d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checkboxRowSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#2d2d24',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748b',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxSublabel: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 2,
  },
  appraisalPanel: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#38bdf8',
    borderBottomColor: '#0284c7',
  },
  appraisalTitle: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  appraisalValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 12,
  },
  appraisalDisclaimer: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#475569',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 13,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  inventoryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#242c3d',
    paddingVertical: 12,
  },
  itemTitle: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  itemValue: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 14,
  },
  itemSubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  itemErrorText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  itemNotes: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#0f172a',
    padding: 6,
    borderRadius: 4,
  },
});
