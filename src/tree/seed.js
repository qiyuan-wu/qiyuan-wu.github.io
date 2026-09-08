// What the page shows before Firestore answers, and what it falls back to if
// Firestore never answers. Editing on the site writes `tree/global` and that
// wins; this file is only ever a starting point.
//
// `newick` is Open Tree of Life's answer for exactly these six tips, saved at
// edit time so no page load has to ask. `clades` names a curated few of the
// splits, keyed by the set of tips beneath each one; adding a species rewrites
// those keys, so labels are carried across by `migrateClades`.
export const SEED = {
  species: [
    { ott: 770315, sci: 'Homo sapiens', common: 'Human' },
    { ott: 417950, sci: 'Pan troglodytes', common: 'Chimpanzee' },
    { ott: 247333, sci: 'Canis lupus familiaris', common: 'Dog' },
    { ott: 563166, sci: 'Felis catus', common: 'Cat' },
    { ott: 913382, sci: 'Pogona vitticeps', common: 'Bearded dragon' },
    { ott: 75257, sci: 'Amanita muscaria', common: 'Fly agaric' },
  ],

  clades: {
    '75257-247333-417950-563166-770315-913382': 'Opisthokonta',
    '247333-417950-563166-770315-913382': 'Amniota',
    '247333-417950-563166-770315': 'Mammalia',
    '417950-770315': 'Hominini',
    '247333-563166': 'Carnivora',
  },

  // Quoted labels below are Open Tree disambiguating homonyms; the parser
  // expects them.
  newick:
    "((((((((((((((((((((((((((((((((((((((((((((((((((((((((Homo_sapiens_ott770315)mrcaott83926ott3607676)mrcaott83926ott3607681)mrcaott83926ott3607671)mrcaott83926ott3607678)Homo_ott770309)mrcaott83926ott3607732)mrcaott83926ott3607689)mrcaott83926ott3607716)mrcaott83926ott3607687,(Pan_troglodytes_ott417950)Pan_ott417957)mrcaott83926ott84217)Homininae_ott312031)mrcaott83926ott3607873)mrcaott83926ott3607876)mrcaott83926ott770295)mrcaott83926ott3607728)mrcaott83926ott6145147)mrcaott83926ott96938)mrcaott83926ott3607702)mrcaott786ott83926)mrcaott786ott3607729)Catarrhini_ott842867)Simiiformes_ott386195)Haplorrhini_ott702152)mrcaott786ott3428)Primates_ott913935)Primatomorpha_ott6520519)Euarchontoglires_ott392222,(((((((((((((((((((((((Canis_lupus_familiaris_ott247333)Canis_lupus_ott247341)mrcaott47497ott3612500)mrcaott47497ott684074)mrcaott47497ott247331)mrcaott47497ott3612503)mrcaott47497ott3612501)mrcaott47497ott3612579)mrcaott47497ott110766)mrcaott47497ott77889)mrcaott47497ott3612592)mrcaott47497ott3612591)mrcaott47497ott3612589)mrcaott47497ott3612516)mrcaott47497ott3612596)mrcaott47497ott3612529)mrcaott47497ott3612617)Canidae_ott770319)Caniformia_ott827263,((((((((((((((Felis_catus_ott563166)mrcaott54737ott563166)mrcaott54737ott983177)mrcaott54737ott983179)Felis_ott563165)mrcaott54737ott86166)mrcaott54737ott86162)mrcaott54737ott442049)mrcaott54737ott86175)mrcaott54737ott86170)mrcaott54737ott660452)Felidae_ott563159)mrcaott19397ott194349)mrcaott6940ott19397)Feliformia_ott827259)mrcaott4697ott6940)Carnivora_ott44565)mrcaott4697ott263949)mrcaott1548ott4697)Laurasiatheria_ott392223)Boreoeutheria_ott5334778)mrcaott42ott72667)mrcaott42ott3607455)mrcaott42ott3607429)mrcaott42ott3607383)'Eutheria (in Deuterostomia) ott683263')'Theria (subclass in Deuterostomia) ott229558')Mammalia_ott244265,(((((((((((((((((((((((((((((((((((Pogona_vitticeps_ott913382)mrcaott281880ott913382)Pogona_ott58620)mrcaott58621ott59261)mrcaott58621ott358144)mrcaott32641ott58621)mrcaott32641ott208241)mrcaott32641ott353659)mrcaott32622ott32641)mrcaott32622ott913385)mrcaott32622ott116307)Amphibolurinae_ott543593)mrcaott32622ott58973)mrcaott2417ott32622)mrcaott2417ott389114)Agamidae_ott101200)mrcaott2417ott4812)'Acrodonta (in Deuterostomia) ott202365')Iguania_ott608979)mrcaott2417ott4124528)mrcaott2417ott97368)mrcaott1662ott2417)Episquamata_ott4945816)Unidentata_ott4945815)Bifurcata_ott4945781)'Squamata (order in Deuterostomia) ott35888')Lepidosauria_ott35881)mrcaott1662ott4947157)mrcaott1662ott664349)mrcaott1662ott4126667)mrcaott1662ott4142716)mrcaott1662ott4129629)mrcaott1662ott4127082)mrcaott1662ott4128455)Sauria_ott329823)Sauropsida_ott639642)Amniota_ott229560)Tetrapoda_ott229562)Dipnotetrapodomorpha_ott4940726)Sarcopterygii_ott458402)Euteleostomi_ott114654)Teleostomi_ott114656)'Gnathostomata (superclass in phylum Chordata) ott278114')'Vertebrata (subphylum in Deuterostomia) ott801601')'Craniata (subphylum in Deuterostomia) ott947318')mrcaott42ott658)Chordata_ott125642)Deuterostomia_ott147604)mrcaott42ott49)Bilateria_ott117569)mrcaott42ott150)mrcaott42ott570365)mrcaott42ott3989)Metazoa_ott691846)mrcaott42ott34294)Holozoa_ott5246131,((((((((((((((((((((((((((((((Amanita_muscaria_ott75257)Amanita_ott75256)Amanitaceae_ott445863)mrcaott1137ott14434)mrcaott1137ott6273)mrcaott1137ott183964)mrcaott206ott1137)mrcaott109ott206)mrcaott109ott30821)mrcaott109ott233596)mrcaott109ott471)mrcaott109ott50573)mrcaott109ott1939)mrcaott109ott9895)mrcaott109ott33764)mrcaott109ott2361)Agaricomycetes_ott1012685)mrcaott109ott357)Agaricomycotina_ott633300)mrcaott109ott491)mrcaott109ott4991)Basidiomycota_ott634628)Dikarya_ott656316)'h2007-1 ott5584405')'h2007-2 ott5576447')mrcaott109ott9352)mrcaott109ott1423)mrcaott109ott67172)mrcaott109ott3465)Fungi_ott352914)Nucletmycea_ott5246132)Opisthokonta_ott332573;",
}
