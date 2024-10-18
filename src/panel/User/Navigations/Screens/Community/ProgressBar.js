import React from 'react';
import { View, Text } from 'react-native';

const ProgressBar1 = ({ value, option }) => {
    return (
        <View style={{ borderWidth: 1, borderColor: "#7d0431", borderRadius: 50, marginTop: 10 }}>
            {value > 0 ? (
                <View style={{
                    backgroundColor: '#ffe1e5',
                    height: 40,
                    borderRadius: 50,
                    width: `${value}%`,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Text style={{ color: "#7d0431", marginLeft: 15 }}>{option}</Text>
                    <Text style={{ color: "#7d0431", marginRight: 15 }}>{`${value}%`}</Text>
                </View>
            ) : (
                <View style={{
                    height: 40,
                    borderRadius: 50,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Text style={{ color: "#7d0431", marginLeft: 15 }}>{option}</Text>
                    <Text style={{ color: "#7d0431", marginRight: 15  }}>{`${value}%`}</Text>
                </View>
            )}
        </View>
    );
};

export default ProgressBar1;
