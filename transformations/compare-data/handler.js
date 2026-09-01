module.exports = function (event, ctx, config, vars) {
    //add your script here to transform or enrich the event
let source1 = {
    "data": {
        "activeUsers": [],
        "inactiveUsers": [
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "SGFsYWs="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Halak"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxp"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Ali"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjE4"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02218"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkhhbGFrQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Halak@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Ali Halak,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "QmVpc2xlcg=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Beisler"
                            ]
                        },
                        {
                            "ByteValues": [
                                "SGVsZ2E="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Helga"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjIy"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02222"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkJlaXNsZXJAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Beisler@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Helga Beisler,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "RGlldHJpY2g="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Dietrich"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Q2FybWVu"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Carmen"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjIz"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02223"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkRpZXRyaWNoQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Dietrich@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Carmen Dietrich,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "R2FsYWJvdmE="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Galabova"
                            ]
                        },
                        {
                            "ByteValues": [
                                "UnVtaXlhbmE="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Rumiyana"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjI0"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02224"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkdhbGFib3ZhQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Galabova@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Rumiyana Galabova,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "S8O2aGxlcg=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Köhler"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RnJhbms="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Frank"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjQ0"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02244"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkZLb2VobGVyQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.FKoehler@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Frank FK\\c3\\b6hler,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "U2NobmVpZGVy"
                            ],
                            "Name": "sn",
                            "Values": [
                                "Schneider"
                            ]
                        },
                        {
                            "ByteValues": [
                                "KzQ5NzExNjYwNjg1NDc="
                            ],
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166068547"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RnJhbnppc2th"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Franziska"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjU3"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02257"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkZTY2huZWlkZXJAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.FSchneider@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Franziska FSchneider,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "TGFuZ2U="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Lange"
                            ]
                        },
                        {
                            "ByteValues": [
                                "KzQ5NzExNjYwNjc1ODI="
                            ],
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166067582"
                            ]
                        },
                        {
                            "ByteValues": [
                                "TWFyY28="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Marco"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjU4"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02258"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkxhbmdlQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Lange@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Marco Lange,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "SGFnZWRvcm4="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Hagedorn"
                            ]
                        },
                        {
                            "ByteValues": [
                                "VG9yYmVu"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Torben"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjcx"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02271"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkhhZ2Vkb3JuQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Hagedorn@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Torben Hagedorn,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "QmVja2Vy"
                            ],
                            "Name": "sn",
                            "Values": [
                                "Becker"
                            ]
                        },
                        {
                            "ByteValues": [
                                "TWljaGFlbA=="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Michael"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjgx"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02281"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLk1CZWNrZXJAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.MBecker@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Michael MBecker,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "TGFuZ2UgKEFkbWluKQ=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Lange (Admin)"
                            ]
                        },
                        {
                            "ByteValues": [
                                "TWFyY28="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Marco"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QTAyMjU4"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "A02258"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MTA0OTA5MA=="
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "1049090"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Marco Lange (Admin),OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "S0lTU19OdXJMZXNlbg=="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "KISS_NurLesen"
                                ]
                            }
                        ],
                        "DN": "CN=KISS_NurLesen,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "S0lTU19BbGxlTGVzZW4="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "KISS_AlleLesen"
                                ]
                            }
                        ],
                        "DN": "CN=KISS_AlleLesen,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "VmFsbG9pcw=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Vallois"
                            ]
                        },
                        {
                            "ByteValues": [
                                "VGhpYmF1bHQ="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Thibault"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMjkw"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02290"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLlZhbGxvaXNAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.Vallois@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Thibault Vallois,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "U2NobmVpZGVy"
                            ],
                            "Name": "sn",
                            "Values": [
                                "Schneider"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxpY2UgQ3Jpc3RpbmE="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Alice Cristina"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RTAyMzEx"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "E02311"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "ZXh0ZXJuLkFTY2huZWlkZXJAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "extern.ASchneider@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "Mg=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ]
                        }
                    ],
                    "DN": "CN=Alice Cristina ASchneider,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "S0lTU19CZWFyYmVpdHVuZw=="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "KISS_Bearbeitung"
                                ]
                            }
                        ],
                        "DN": "CN=KISS_Bearbeitung,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "WkVCUkFfQmVhcmJlaXR1bmc="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "ZEBRA_Bearbeitung"
                                ]
                            }
                        ],
                        "DN": "CN=ZEBRA_Bearbeitung,OU=APP-ZEBRA,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "UXVhZHJhbm8="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Quadrano"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QW50b25pZXR0YQ=="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Antonietta"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjgx"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02681"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QW50b25pZXR0YS5RdWFkcmFub0BjcmVkaXRwbHVzLmRl"
                            ],
                            "Name": "mail",
                            "Values": [
                                "Antonietta.Quadrano@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Antonietta Quadrano,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "U2VnYXJpYw=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Segaric"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxleGFuZGVy"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Alexander"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjY0"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02664"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxleGFuZGVyLlNlZ2FyaWNAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "Alexander.Segaric@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Alexander Segaric,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "QlJBSU5fTnVyTGVzZW4="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "BRAIN_NurLesen"
                                ]
                            }
                        ],
                        "DN": "CN=BRAIN_NurLesen,OU=APP-BRAIN,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "UmFuZGhhd2E="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Randhawa"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QW1yaXQgTmFuaW5h"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Amrit Nanina"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjU1"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02655"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QW1yaXQtTmFuaW5hLlJhbmRoYXdhQGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "Amrit-Nanina.Randhawa@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Amrit Nanina Randhawa,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "UFBOX1pLUw=="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "PPN_ZKS"
                                ]
                            }
                        ],
                        "DN": "CN=PPN_ZKS,OU=APP-PPNFE,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "TmlraWM="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Nikic"
                            ]
                        },
                        {
                            "ByteValues": [
                                "KzQ5NzExNjYwNjgyMDM="
                            ],
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166068203"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxpbmE="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Alina"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjcx"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02671"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QWxpbmEuTmlraWNAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "Alina.Nikic@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Alina Nikic,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "V2FuZw=="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Wang"
                            ]
                        },
                        {
                            "ByteValues": [
                                "WWltZWk="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Yimei"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjg2"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02686"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "WWltZWkuV2FuZ0BjcmVkaXRwbHVzLmRl"
                            ],
                            "Name": "mail",
                            "Values": [
                                "Yimei.Wang@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Yimei Wang,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "S0lTU19CZWFyYmVpdHVuZw=="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "KISS_Bearbeitung"
                                ]
                            }
                        ],
                        "DN": "CN=KISS_Bearbeitung,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "WkVCUkFfQmVhcmJlaXR1bmc="
                                ],
                                "Name": "cn",
                                "Values": [
                                    "ZEBRA_Bearbeitung"
                                ]
                            }
                        ],
                        "DN": "CN=ZEBRA_Bearbeitung,OU=APP-ZEBRA,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    },
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "SGVsZHQ="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Heldt"
                            ]
                        },
                        {
                            "ByteValues": [
                                "U3RlZmFu"
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Stefan"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjkz"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02693"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "U3RlZmFuLkhlbGR0QGNyZWRpdHBsdXMuZGU="
                            ],
                            "Name": "mail",
                            "Values": [
                                "Stefan.Heldt@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Stefan Heldt,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "U2lkaHU="
                            ],
                            "Name": "sn",
                            "Values": [
                                "Sidhu"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QXJlbnZpcg=="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Arenvir"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjk0"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02694"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "QXJlbnZpci5TaWRodUBjcmVkaXRwbHVzLmRl"
                            ],
                            "Name": "mail",
                            "Values": [
                                "Arenvir.Sidhu@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Arenvir Sidhu,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            },
            {
                "groups": [
                    {
                        "Attributes": [
                            {
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ],
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ]
                            }
                        ],
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int"
                    }
                ],
                "user": {
                    "Attributes": [
                        {
                            "ByteValues": [
                                "RWJlcmhhcmR0"
                            ],
                            "Name": "sn",
                            "Values": [
                                "Eberhardt"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RG9taW5pcXVlIEthdGhhcmluYQ=="
                            ],
                            "Name": "givenName",
                            "Values": [
                                "Dominique Katharina"
                            ]
                        },
                        {
                            "ByteValues": [
                                "STAyNjk1"
                            ],
                            "Name": "employeeNumber",
                            "Values": [
                                "I02695"
                            ]
                        },
                        {
                            "ByteValues": [
                                "NTE0"
                            ],
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ]
                        },
                        {
                            "ByteValues": [
                                "RG9taW5pcXVlLUthdGhhcmluYS5FYmVyaGFyZHRAY3JlZGl0cGx1cy5kZQ=="
                            ],
                            "Name": "mail",
                            "Values": [
                                "Dominique-Katharina.Eberhardt@creditplus.de"
                            ]
                        },
                        {
                            "ByteValues": [
                                "MA=="
                            ],
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ]
                        }
                    ],
                    "DN": "CN=Dominique Katharina Eberhardt,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "userAccountStatus": "inactive"
                }
            }
        ]
    }
};

let source2 = {
    "data": {
        "inactiveUsers": [
            {
                "user": {
                    "DN": "CN=Ali Halak,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Halak"
                            ],
                            "ByteValues": [
                                "SGFsYWs="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Ali"
                            ],
                            "ByteValues": [
                                "QWxp"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02218"
                            ],
                            "ByteValues": [
                                "RTAyMjE4"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Halak@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkhhbGFrQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Helga Beisler,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Beisler"
                            ],
                            "ByteValues": [
                                "QmVpc2xlcg=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Helga"
                            ],
                            "ByteValues": [
                                "SGVsZ2E="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02222"
                            ],
                            "ByteValues": [
                                "RTAyMjIy"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Beisler@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkJlaXNsZXJAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Carmen Dietrich,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Dietrich"
                            ],
                            "ByteValues": [
                                "RGlldHJpY2g="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Carmen"
                            ],
                            "ByteValues": [
                                "Q2FybWVu"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02223"
                            ],
                            "ByteValues": [
                                "RTAyMjIz"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Dietrich@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkRpZXRyaWNoQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Rumiyana Galabova,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Galabova"
                            ],
                            "ByteValues": [
                                "R2FsYWJvdmE="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Rumiyana"
                            ],
                            "ByteValues": [
                                "UnVtaXlhbmE="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02224"
                            ],
                            "ByteValues": [
                                "RTAyMjI0"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Galabova@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkdhbGFib3ZhQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Frank FKöhler,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Köhler"
                            ],
                            "ByteValues": [
                                "S8O2aGxlcg=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Frank"
                            ],
                            "ByteValues": [
                                "RnJhbms="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02244"
                            ],
                            "ByteValues": [
                                "RTAyMjQ0"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.FKoehler@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkZLb2VobGVyQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Franziska FSchneider,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Schneider"
                            ],
                            "ByteValues": [
                                "U2NobmVpZGVy"
                            ]
                        },
                        {
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166068547"
                            ],
                            "ByteValues": [
                                "KzQ5NzExNjYwNjg1NDc="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Franziska"
                            ],
                            "ByteValues": [
                                "RnJhbnppc2th"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02257"
                            ],
                            "ByteValues": [
                                "RTAyMjU3"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.FSchneider@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkZTY2huZWlkZXJAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Marco Lange,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Lange"
                            ],
                            "ByteValues": [
                                "TGFuZ2U="
                            ]
                        },
                        {
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166067582"
                            ],
                            "ByteValues": [
                                "KzQ5NzExNjYwNjc1ODI="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Marco"
                            ],
                            "ByteValues": [
                                "TWFyY28="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02258"
                            ],
                            "ByteValues": [
                                "RTAyMjU4"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Lange@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkxhbmdlQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Torben Hagedorn,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Hagedorn"
                            ],
                            "ByteValues": [
                                "SGFnZWRvcm4="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Torben"
                            ],
                            "ByteValues": [
                                "VG9yYmVu"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02271"
                            ],
                            "ByteValues": [
                                "RTAyMjcx"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Hagedorn@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkhhZ2Vkb3JuQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Michael MBecker,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Becker"
                            ],
                            "ByteValues": [
                                "QmVja2Vy"
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Michael"
                            ],
                            "ByteValues": [
                                "TWljaGFlbA=="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02281"
                            ],
                            "ByteValues": [
                                "RTAyMjgx"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.MBecker@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLk1CZWNrZXJAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Marco Lange (Admin),OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Lange (Admin)"
                            ],
                            "ByteValues": [
                                "TGFuZ2UgKEFkbWluKQ=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Marco"
                            ],
                            "ByteValues": [
                                "TWFyY28="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "A02258"
                            ],
                            "ByteValues": [
                                "QTAyMjU4"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "1049090"
                            ],
                            "ByteValues": [
                                "MTA0OTA5MA=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Thibault Vallois,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Vallois"
                            ],
                            "ByteValues": [
                                "VmFsbG9pcw=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Thibault"
                            ],
                            "ByteValues": [
                                "VGhpYmF1bHQ="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02290"
                            ],
                            "ByteValues": [
                                "RTAyMjkw"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.Vallois@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLlZhbGxvaXNAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=KISS_NurLesen,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "KISS_NurLesen"
                                ],
                                "ByteValues": [
                                    "S0lTU19OdXJMZXNlbg=="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=KISS_AlleLesen,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "KISS_AlleLesen"
                                ],
                                "ByteValues": [
                                    "S0lTU19BbGxlTGVzZW4="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Alice Cristina ASchneider,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Schneider"
                            ],
                            "ByteValues": [
                                "U2NobmVpZGVy"
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Alice Cristina"
                            ],
                            "ByteValues": [
                                "QWxpY2UgQ3Jpc3RpbmE="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "E02311"
                            ],
                            "ByteValues": [
                                "RTAyMzEx"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "extern.ASchneider@creditplus.de"
                            ],
                            "ByteValues": [
                                "ZXh0ZXJuLkFTY2huZWlkZXJAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "2"
                            ],
                            "ByteValues": [
                                "Mg=="
                            ]
                        }
                    ]
                }
            },
            {
                "user": {
                    "DN": "CN=Antonietta Quadrano,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Quadrano"
                            ],
                            "ByteValues": [
                                "UXVhZHJhbm8="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Antonietta"
                            ],
                            "ByteValues": [
                                "QW50b25pZXR0YQ=="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02681"
                            ],
                            "ByteValues": [
                                "STAyNjgx"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Antonietta.Quadrano@creditplus.de"
                            ],
                            "ByteValues": [
                                "QW50b25pZXR0YS5RdWFkcmFub0BjcmVkaXRwbHVzLmRl"
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=KISS_Bearbeitung,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "KISS_Bearbeitung"
                                ],
                                "ByteValues": [
                                    "S0lTU19CZWFyYmVpdHVuZw=="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=ZEBRA_Bearbeitung,OU=APP-ZEBRA,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "ZEBRA_Bearbeitung"
                                ],
                                "ByteValues": [
                                    "WkVCUkFfQmVhcmJlaXR1bmc="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Alexander Segaric,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Segaric"
                            ],
                            "ByteValues": [
                                "U2VnYXJpYw=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Alexander"
                            ],
                            "ByteValues": [
                                "QWxleGFuZGVy"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02664"
                            ],
                            "ByteValues": [
                                "STAyNjY0"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Alexander.Segaric@creditplus.de"
                            ],
                            "ByteValues": [
                                "QWxleGFuZGVyLlNlZ2FyaWNAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Amrit Nanina Randhawa,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Randhawa"
                            ],
                            "ByteValues": [
                                "UmFuZGhhd2E="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Amrit Nanina"
                            ],
                            "ByteValues": [
                                "QW1yaXQgTmFuaW5h"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02655"
                            ],
                            "ByteValues": [
                                "STAyNjU1"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Amrit-Nanina.Randhawa@creditplus.de"
                            ],
                            "ByteValues": [
                                "QW1yaXQtTmFuaW5hLlJhbmRoYXdhQGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=BRAIN_NurLesen,OU=APP-BRAIN,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "BRAIN_NurLesen"
                                ],
                                "ByteValues": [
                                    "QlJBSU5fTnVyTGVzZW4="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Alina Nikic,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Nikic"
                            ],
                            "ByteValues": [
                                "TmlraWM="
                            ]
                        },
                        {
                            "Name": "telephoneNumber",
                            "Values": [
                                "+4971166068203"
                            ],
                            "ByteValues": [
                                "KzQ5NzExNjYwNjgyMDM="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Alina"
                            ],
                            "ByteValues": [
                                "QWxpbmE="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02671"
                            ],
                            "ByteValues": [
                                "STAyNjcx"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Alina.Nikic@creditplus.de"
                            ],
                            "ByteValues": [
                                "QWxpbmEuTmlraWNAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=PPN_ZKS,OU=APP-PPNFE,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "PPN_ZKS"
                                ],
                                "ByteValues": [
                                    "UFBOX1pLUw=="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Yimei Wang,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Wang"
                            ],
                            "ByteValues": [
                                "V2FuZw=="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Yimei"
                            ],
                            "ByteValues": [
                                "WWltZWk="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02686"
                            ],
                            "ByteValues": [
                                "STAyNjg2"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Yimei.Wang@creditplus.de"
                            ],
                            "ByteValues": [
                                "WWltZWkuV2FuZ0BjcmVkaXRwbHVzLmRl"
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Stefan Heldt,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Heldt"
                            ],
                            "ByteValues": [
                                "SGVsZHQ="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Stefan"
                            ],
                            "ByteValues": [
                                "U3RlZmFu"
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02693"
                            ],
                            "ByteValues": [
                                "STAyNjkz"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Stefan.Heldt@creditplus.de"
                            ],
                            "ByteValues": [
                                "U3RlZmFuLkhlbGR0QGNyZWRpdHBsdXMuZGU="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=KISS_Bearbeitung,OU=APP-KISS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "KISS_Bearbeitung"
                                ],
                                "ByteValues": [
                                    "S0lTU19CZWFyYmVpdHVuZw=="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=ZEBRA_Bearbeitung,OU=APP-ZEBRA,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "ZEBRA_Bearbeitung"
                                ],
                                "ByteValues": [
                                    "WkVCUkFfQmVhcmJlaXR1bmc="
                                ]
                            }
                        ]
                    },
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Arenvir Sidhu,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Sidhu"
                            ],
                            "ByteValues": [
                                "U2lkaHU="
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Arenvir"
                            ],
                            "ByteValues": [
                                "QXJlbnZpcg=="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02694"
                            ],
                            "ByteValues": [
                                "STAyNjk0"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Arenvir.Sidhu@creditplus.de"
                            ],
                            "ByteValues": [
                                "QXJlbnZpci5TaWRodUBjcmVkaXRwbHVzLmRl"
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "user": {
                    "DN": "CN=Dominique Katharina Eberhardt,OU=Benutzer,OU=_Creditplus,DC=creditplus,DC=int",
                    "Attributes": [
                        {
                            "Name": "sn",
                            "Values": [
                                "Eberhardt"
                            ],
                            "ByteValues": [
                                "RWJlcmhhcmR0"
                            ]
                        },
                        {
                            "Name": "givenName",
                            "Values": [
                                "Dominique Katharina"
                            ],
                            "ByteValues": [
                                "RG9taW5pcXVlIEthdGhhcmluYQ=="
                            ]
                        },
                        {
                            "Name": "employeeNumber",
                            "Values": [
                                "I02695"
                            ],
                            "ByteValues": [
                                "STAyNjk1"
                            ]
                        },
                        {
                            "Name": "userAccountControl",
                            "Values": [
                                "514"
                            ],
                            "ByteValues": [
                                "NTE0"
                            ]
                        },
                        {
                            "Name": "mail",
                            "Values": [
                                "Dominique-Katharina.Eberhardt@creditplus.de"
                            ],
                            "ByteValues": [
                                "RG9taW5pcXVlLUthdGhhcmluYS5FYmVyaGFyZHRAY3JlZGl0cGx1cy5kZQ=="
                            ]
                        },
                        {
                            "Name": "gCAAttribute1",
                            "Values": [
                                "0"
                            ],
                            "ByteValues": [
                                "MA=="
                            ]
                        }
                    ]
                },
                "groups": [
                    {
                        "DN": "CN=SUCHSERVICE_Allgemein,OU=APP-SUCHS,OU=Sync2Cidaas,OU=Sicherheit,OU=Gruppen,OU=_Creditplus,DC=creditplus,DC=int",
                        "Attributes": [
                            {
                                "Name": "cn",
                                "Values": [
                                    "SUCHSERVICE_Allgemein"
                                ],
                                "ByteValues": [
                                    "U1VDSFNFUlZJQ0VfQWxsZ2VtZWlu"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
console.log(source1, source2)
    //remember to return the transformed event object for the pipeline to continue processing the event
    return event;
}

    // Deep comparison function
    deepEqual = function(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    // Normalize users and their groups for accurate comparison
    normalizeUsers = function(users) {
        return users.map(entry => ({
            DN: entry.user.DN,
            userAccountStatus: entry.user.userAccountStatus,
            Attributes: entry.user.Attributes
                .map(attr => ({
                    Name: attr.Name,
                    Values: attr.Values.sort()
                }))
                .sort((a, b) => a.Name.localeCompare(b.Name)),
            Groups: entry.groups.map(group => ({
                DN: group.DN,
                Attributes: group.Attributes
                    .map(attr => ({
                        Name: attr.Name,
                        Values: attr.Values.sort()
                    }))
                    .sort((a, b) => a.Name.localeCompare(b.Name))
            })).sort((a, b) => a.DN.localeCompare(b.DN)) // Sort groups by DN
        })).sort((a, b) => a.DN.localeCompare(b.DN)); // Sort users by DN
    }

    // Compare datasets of both sources
    compareDatasets = function(source1, source2) {
        const users1 = this.normalizeUsers(source1.data.inactiveUsers);
        const users2 = this.normalizeUsers(source2.data.inactiveUsers);

        return this.deepEqual(users1, users2);
    }
