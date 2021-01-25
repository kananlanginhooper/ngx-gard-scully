const util = require('./util');

class DiseaseAttributes {

  DiseaseData;

  constructor() {
    this.DiseaseData = new Map();
  }

  AddDisease(DiseaseID) {
    if (!this.IsDisease(DiseaseID)) {
      this.DiseaseData.set(DiseaseID, new Map());
    }
  }

  AddAttribute(DiseaseID, Name, Value) {
    if (this.IsDisease(DiseaseID)) { // make sure we have the disease
      if (!this.IsSetAttribute(DiseaseID, Name)) { // make sure we haven't saved this attribute already
        this.DiseaseData.get(DiseaseID).set(Name, Value);
      } else {
        // Already set
      }
    } else {
      // Disease not added
    }
  }

  AddAttributeMap(DiseaseID, map) {
    if (this.IsDisease(DiseaseID)) { // make sure we have the disease
      map.forEach((value, key) => {
        if (!this.IsSetAttribute(DiseaseID, key)) { // make sure we haven't saved this attribute already
          this.DiseaseData.get(DiseaseID).set(key, value);
        } else {
          // Already set
        }
      });
    } else {
      // Disease not added
    }
  }

  GetAttribute(DiseaseID, Name) {
    if (this.IsDisease(DiseaseID)) { // make sure we have the disease
      if (this.IsSetAttribute(DiseaseID, Name)) { // make sure we haven't saved this attribute already
        return this.DiseaseData.get(DiseaseID).get(Name);
      } else {
        // Nothing set
      }
    } else {
      // Disease not added
    }
  }

  IsDisease(DiseaseID) {
    return this.DiseaseData.has(DiseaseID);
  }

  IsSetAttribute(DiseaseID, Name) {
    if (this.IsDisease(DiseaseID)) { // make sure we have the disease
      return this.DiseaseData.get(DiseaseID).has(Name);
    } else {
      // Disease not added
    }
  }

  AddFromDiseaseDetailFormat(json) {
    const DiseaseID = json.DiseaseID__c;
    if (!this.IsDisease(DiseaseID)) {
      this.AddDisease(DiseaseID);
    }

    const DiseaseName = util.Encode(json.Name);
    json = {...json, ...{EncodedName: DiseaseName}};
    const keys = Object.keys(json);

    keys.forEach(key => {
      const value = json[key];
      if (value !== null && key !== 'attributes') {
        this.AddAttribute(DiseaseID, key, value);
      }
    });

  }

  KVPFromAttributeListItem(DiseaseData, attribute) {
    let key = attribute['attributes']['type'];
    let arr;

    switch (key) {
      case 'GARD_Disease__c':
        DiseaseData.set(key, attribute['DiseaseID__c']);
        break;
      case 'External_Identifier_Disease__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({source: attribute['Source__c'], value: attribute['Display_Value__c']});
        // DiseaseData.set(key, arr); // should be in effect by refs
        break;
      case 'GARD_Disease_Gene__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          Gene_Symbol: attribute['Gene_Symbol__c'],
          GeneId: attribute['GeneName__c'],
          DzGeneAssociation: attribute['DzGeneAssociation__c'],
          GeneName: attribute['Gene_Name__c'],
          DzGeneAssociation_AttributionSource: attribute['DzGeneAssociation_AttributionSource__c']
        });
        // DiseaseData.set(key, arr); // should be in effect by refs
        break;
      case 'Age_At_Onset__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          value: attribute['Age_At_Onset__c'],
          AttributionSource: attribute['AgeAtOnset_AttributionSource__c']
        });
        break;
      case 'Age_At_Death__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          value: attribute['Age_At_Death__c'],
          AttributionSource: attribute['AgeAtDeath_AttributionSource__c']
        });
        break;
      case 'Evidence__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          type: attribute['Evidence_Type__c'],
          label: attribute['Evidence_Label__c'],
          url: attribute['Evidence_URL__c']
        });
        break;
      case 'Organization_Supported_Diseases__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({name: attribute['Name'], url: attribute['Website__c']});
        break;
      case 'Epidemiology__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          type: attribute['Type__c'],
          validation: attribute['Source_Validation__c'],
          value: attribute['Value__c'],
          source: attribute['Epidemiology_AttributionSource__c'],
          location: attribute['Location__c'],
          qualification: attribute['Qualification__c'],
          range: attribute['Range__c']
        });
        break;
      case 'Disease_Synonym__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push(attribute['Disease_Synonym__c']);
        break;
      case 'Inheritance__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push(attribute['Inheritance_Attribution__c']);
        break;
      case 'GARD_Disease_Feature__c':
        if (!DiseaseData.has(key)) {
          DiseaseData.set(key, new Array());
        }
        arr = DiseaseData.get(key);
        arr.push({
          NameMaping: attribute['HPO_NAME_MAPPING__c'],
          NameMap: attribute['HPO_Name_map__c'],
          SourceCurie: attribute['Source_Curie__c'],
          Description: attribute['HPO_Description__c'],
          Category: attribute['HPO_Category__c'],
          Frequency: attribute['HPO_Frequency__c'],
          Method: attribute['HPO_Method__c']
        });
        break;
    }

    return DiseaseData;
  }


  AddFromAttributeListFormat(json) {

    let DiseaseData = new Map();

    json.forEach(attribute => {
      // DiseaseData = this.KVPFromAttributeListItem(DiseaseData, attribute);
      this.KVPFromAttributeListItem(DiseaseData, attribute);
    });

    const DiseaseID = DiseaseData.get('GARD_Disease__c');
    if (!this.IsDisease(DiseaseID)) {
      this.AddDisease(DiseaseID);
    }

    this.AddAttributeMap(DiseaseID, DiseaseData);

    return DiseaseID;
  }

  GetDiseaseJsonString(DiseaseID) {
    if (this.IsDisease(DiseaseID)) { // make sure we have the disease
      return JSON.stringify(Object.fromEntries(this.DiseaseData.get(DiseaseID)));
    } else {
      // Disease not added
    }
  }

  AppendDiseaseJsonString(strJson) {
    const json = JSON.parse(strJson);
    const DiseaseID = json['DiseaseID__c'];
    if (!this.IsDisease(DiseaseID)) { // make sure we have the disease
      this.AddDisease(DiseaseID);
    }

    const keys = Object.keys(json);
    keys.forEach(key => {
      const value = json[key];
      if (value !== null && key !== 'attributes') {
        this.AddAttribute(DiseaseID, key, value);
      }
    });
  }

}

module.exports = {
  DiseaseAttributes
}
