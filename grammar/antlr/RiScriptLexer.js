// Generated from grammar/RiScriptLexer.g4 by ANTLR 4.9.1
// jshint ignore: start
import antlr4 from 'antlr4';



const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0002#\u00ef\b\u0001\b\u0001\u0004\u0002\t\u0002\u0004\u0003",
    "\t\u0003\u0004\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006",
    "\u0004\u0007\t\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b",
    "\t\u000b\u0004\f\t\f\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f",
    "\u0004\u0010\t\u0010\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013",
    "\t\u0013\u0004\u0014\t\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016",
    "\u0004\u0017\t\u0017\u0004\u0018\t\u0018\u0004\u0019\t\u0019\u0004\u001a",
    "\t\u001a\u0004\u001b\t\u001b\u0004\u001c\t\u001c\u0004\u001d\t\u001d",
    "\u0004\u001e\t\u001e\u0004\u001f\t\u001f\u0004 \t \u0004!\t!\u0004\"",
    "\t\"\u0004#\t#\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0007",
    "\u0002M\n\u0002\f\u0002\u000e\u0002P\u000b\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0007\u0003[\n\u0003\f\u0003\u000e\u0003^\u000b\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0005\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0006\u0003\u0006\u0003",
    "\u0007\u0003\u0007\u0003\b\u0003\b\u0003\t\u0003\t\u0003\n\u0003\n\u0003",
    "\u000b\u0003\u000b\u0003\f\u0003\f\u0003\r\u0003\r\u0003\u000e\u0003",
    "\u000e\u0003\u000f\u0003\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003",
    "\u0011\u0003\u0012\u0003\u0012\u0003\u0013\u0003\u0013\u0003\u0014\u0003",
    "\u0014\u0003\u0014\u0003\u0015\u0005\u0015\u008a\n\u0015\u0003\u0015",
    "\u0003\u0015\u0003\u0016\u0003\u0016\u0003\u0016\u0003\u0017\u0003\u0017",
    "\u0003\u0017\u0003\u0017\u0003\u0017\u0003\u0018\u0003\u0018\u0003\u0018",
    "\u0003\u0019\u0007\u0019\u009a\n\u0019\f\u0019\u000e\u0019\u009d\u000b",
    "\u0019\u0003\u0019\u0003\u0019\u0007\u0019\u00a1\n\u0019\f\u0019\u000e",
    "\u0019\u00a4\u000b\u0019\u0003\u001a\u0007\u001a\u00a7\n\u001a\f\u001a",
    "\u000e\u001a\u00aa\u000b\u001a\u0003\u001a\u0003\u001a\u0007\u001a\u00ae",
    "\n\u001a\f\u001a\u000e\u001a\u00b1\u000b\u001a\u0003\u001b\u0003\u001b",
    "\u0006\u001b\u00b5\n\u001b\r\u001b\u000e\u001b\u00b6\u0003\u001b\u0003",
    "\u001b\u0003\u001c\u0007\u001c\u00bc\n\u001c\f\u001c\u000e\u001c\u00bf",
    "\u000b\u001c\u0003\u001c\u0006\u001c\u00c2\n\u001c\r\u001c\u000e\u001c",
    "\u00c3\u0003\u001c\u0007\u001c\u00c7\n\u001c\f\u001c\u000e\u001c\u00ca",
    "\u000b\u001c\u0003\u001d\u0003\u001d\u0003\u001d\u0003\u001e\u0006\u001e",
    "\u00d0\n\u001e\r\u001e\u000e\u001e\u00d1\u0003\u001f\u0003\u001f\u0007",
    "\u001f\u00d6\n\u001f\f\u001f\u000e\u001f\u00d9\u000b\u001f\u0003 \u0003",
    " \u0003 \u0003 \u0003 \u0003!\u0003!\u0007!\u00e2\n!\f!\u000e!\u00e5",
    "\u000b!\u0003\"\u0006\"\u00e8\n\"\r\"\u000e\"\u00e9\u0003#\u0003#\u0003",
    "#\u0003#\u0003N\u0002$\u0004\u0003\u0006\u0004\b\u0005\n\u0006\f\u0007",
    "\u000e\b\u0010\t\u0012\n\u0014\u000b\u0016\f\u0018\r\u001a\u000e\u001c",
    "\u000f\u001e\u0010 \u0011\"\u0012$\u0013&\u0014(\u0015*\u0016,\u0017",
    ".\u00180\u00192\u001a4\u001b6\u001c8\u001d:\u001e<\u001f> @!B\u0002",
    "D\"F#\u0004\u0002\u0003\r\u0005\u0002\f\f\u000f\u000f\u202a\u202b\u0004",
    "\u0002\u000b\u000b\"\"\u0003\u0002*+\u0006\u0002%%2;C\\c|\u0003\u0002",
    "2;\b\u0002##&&,,>>@@``\n\u0002\u000b\f\"\"&&*,01>@]_}\u007f\u0005\u0002",
    "C\\aac|\u0007\u0002//2;C\\aac|\u0006\u00022;C\\aac|\u0003\u0002++\u0002",
    "\u00fb\u0002\u0004\u0003\u0002\u0002\u0002\u0002\u0006\u0003\u0002\u0002",
    "\u0002\u0002\b\u0003\u0002\u0002\u0002\u0002\n\u0003\u0002\u0002\u0002",
    "\u0002\f\u0003\u0002\u0002\u0002\u0002\u000e\u0003\u0002\u0002\u0002",
    "\u0002\u0010\u0003\u0002\u0002\u0002\u0002\u0012\u0003\u0002\u0002\u0002",
    "\u0002\u0014\u0003\u0002\u0002\u0002\u0002\u0016\u0003\u0002\u0002\u0002",
    "\u0002\u0018\u0003\u0002\u0002\u0002\u0002\u001a\u0003\u0002\u0002\u0002",
    "\u0002\u001c\u0003\u0002\u0002\u0002\u0002\u001e\u0003\u0002\u0002\u0002",
    "\u0002 \u0003\u0002\u0002\u0002\u0002\"\u0003\u0002\u0002\u0002\u0002",
    "$\u0003\u0002\u0002\u0002\u0002&\u0003\u0002\u0002\u0002\u0002(\u0003",
    "\u0002\u0002\u0002\u0002*\u0003\u0002\u0002\u0002\u0002,\u0003\u0002",
    "\u0002\u0002\u0002.\u0003\u0002\u0002\u0002\u00020\u0003\u0002\u0002",
    "\u0002\u00022\u0003\u0002\u0002\u0002\u00024\u0003\u0002\u0002\u0002",
    "\u00026\u0003\u0002\u0002\u0002\u00028\u0003\u0002\u0002\u0002\u0002",
    ":\u0003\u0002\u0002\u0002\u0002<\u0003\u0002\u0002\u0002\u0002>\u0003",
    "\u0002\u0002\u0002\u0002@\u0003\u0002\u0002\u0002\u0003D\u0003\u0002",
    "\u0002\u0002\u0003F\u0003\u0002\u0002\u0002\u0004H\u0003\u0002\u0002",
    "\u0002\u0006V\u0003\u0002\u0002\u0002\ba\u0003\u0002\u0002\u0002\nd",
    "\u0003\u0002\u0002\u0002\fi\u0003\u0002\u0002\u0002\u000ek\u0003\u0002",
    "\u0002\u0002\u0010m\u0003\u0002\u0002\u0002\u0012o\u0003\u0002\u0002",
    "\u0002\u0014q\u0003\u0002\u0002\u0002\u0016s\u0003\u0002\u0002\u0002",
    "\u0018u\u0003\u0002\u0002\u0002\u001aw\u0003\u0002\u0002\u0002\u001c",
    "y\u0003\u0002\u0002\u0002\u001e{\u0003\u0002\u0002\u0002 }\u0003\u0002",
    "\u0002\u0002\"\u007f\u0003\u0002\u0002\u0002$\u0081\u0003\u0002\u0002",
    "\u0002&\u0083\u0003\u0002\u0002\u0002(\u0085\u0003\u0002\u0002\u0002",
    "*\u0089\u0003\u0002\u0002\u0002,\u008d\u0003\u0002\u0002\u0002.\u0090",
    "\u0003\u0002\u0002\u00020\u0095\u0003\u0002\u0002\u00022\u009b\u0003",
    "\u0002\u0002\u00024\u00a8\u0003\u0002\u0002\u00026\u00b2\u0003\u0002",
    "\u0002\u00028\u00bd\u0003\u0002\u0002\u0002:\u00cb\u0003\u0002\u0002",
    "\u0002<\u00cf\u0003\u0002\u0002\u0002>\u00d3\u0003\u0002\u0002\u0002",
    "@\u00da\u0003\u0002\u0002\u0002B\u00df\u0003\u0002\u0002\u0002D\u00e7",
    "\u0003\u0002\u0002\u0002F\u00eb\u0003\u0002\u0002\u0002HI\u00071\u0002",
    "\u0002IJ\u0007,\u0002\u0002JN\u0003\u0002\u0002\u0002KM\u000b\u0002",
    "\u0002\u0002LK\u0003\u0002\u0002\u0002MP\u0003\u0002\u0002\u0002NO\u0003",
    "\u0002\u0002\u0002NL\u0003\u0002\u0002\u0002OQ\u0003\u0002\u0002\u0002",
    "PN\u0003\u0002\u0002\u0002QR\u0007,\u0002\u0002RS\u00071\u0002\u0002",
    "ST\u0003\u0002\u0002\u0002TU\b\u0002\u0002\u0002U\u0005\u0003\u0002",
    "\u0002\u0002VW\u00071\u0002\u0002WX\u00071\u0002\u0002X\\\u0003\u0002",
    "\u0002\u0002Y[\n\u0002\u0002\u0002ZY\u0003\u0002\u0002\u0002[^\u0003",
    "\u0002\u0002\u0002\\Z\u0003\u0002\u0002\u0002\\]\u0003\u0002\u0002\u0002",
    "]_\u0003\u0002\u0002\u0002^\\\u0003\u0002\u0002\u0002_`\b\u0003\u0002",
    "\u0002`\u0007\u0003\u0002\u0002\u0002ab\u0005\u0016\u000b\u0002bc\u0007",
    "A\u0002\u0002c\t\u0003\u0002\u0002\u0002de\u0005\u0012\t\u0002ef\u0005",
    "\f\u0006\u0002fg\u0003\u0002\u0002\u0002gh\b\u0005\u0003\u0002h\u000b",
    "\u0003\u0002\u0002\u0002ij\u0007*\u0002\u0002j\r\u0003\u0002\u0002\u0002",
    "kl\u0007+\u0002\u0002l\u000f\u0003\u0002\u0002\u0002mn\u0007]\u0002",
    "\u0002n\u0011\u0003\u0002\u0002\u0002op\u0007_\u0002\u0002p\u0013\u0003",
    "\u0002\u0002\u0002qr\u0007}\u0002\u0002r\u0015\u0003\u0002\u0002\u0002",
    "st\u0007\u007f\u0002\u0002t\u0017\u0003\u0002\u0002\u0002uv\u00071\u0002",
    "\u0002v\u0019\u0003\u0002\u0002\u0002wx\u0007,\u0002\u0002x\u001b\u0003",
    "\u0002\u0002\u0002yz\u0007&\u0002\u0002z\u001d\u0003\u0002\u0002\u0002",
    "{|\u0007.\u0002\u0002|\u001f\u0003\u0002\u0002\u0002}~\u0007@\u0002",
    "\u0002~!\u0003\u0002\u0002\u0002\u007f\u0080\u0007>\u0002\u0002\u0080",
    "#\u0003\u0002\u0002\u0002\u0081\u0082\u00070\u0002\u0002\u0082%\u0003",
    "\u0002\u0002\u0002\u0083\u0084\t\u0003\u0002\u0002\u0084\'\u0003\u0002",
    "\u0002\u0002\u0085\u0086\u0007^\u0002\u0002\u0086\u0087\t\u0004\u0002",
    "\u0002\u0087)\u0003\u0002\u0002\u0002\u0088\u008a\u0007\u000f\u0002",
    "\u0002\u0089\u0088\u0003\u0002\u0002\u0002\u0089\u008a\u0003\u0002\u0002",
    "\u0002\u008a\u008b\u0003\u0002\u0002\u0002\u008b\u008c\u0007\f\u0002",
    "\u0002\u008c+\u0003\u0002\u0002\u0002\u008d\u008e\u00070\u0002\u0002",
    "\u008e\u008f\u0005>\u001f\u0002\u008f-\u0003\u0002\u0002\u0002\u0090",
    "\u0091\u0007&\u0002\u0002\u0091\u0092\u0007&\u0002\u0002\u0092\u0093",
    "\u0003\u0002\u0002\u0002\u0093\u0094\u0005B!\u0002\u0094/\u0003\u0002",
    "\u0002\u0002\u0095\u0096\u0007&\u0002\u0002\u0096\u0097\u0005B!\u0002",
    "\u00971\u0003\u0002\u0002\u0002\u0098\u009a\u0005&\u0013\u0002\u0099",
    "\u0098\u0003\u0002\u0002\u0002\u009a\u009d\u0003\u0002\u0002\u0002\u009b",
    "\u0099\u0003\u0002\u0002\u0002\u009b\u009c\u0003\u0002\u0002\u0002\u009c",
    "\u009e\u0003\u0002\u0002\u0002\u009d\u009b\u0003\u0002\u0002\u0002\u009e",
    "\u00a2\u0007~\u0002\u0002\u009f\u00a1\u0005&\u0013\u0002\u00a0\u009f",
    "\u0003\u0002\u0002\u0002\u00a1\u00a4\u0003\u0002\u0002\u0002\u00a2\u00a0",
    "\u0003\u0002\u0002\u0002\u00a2\u00a3\u0003\u0002\u0002\u0002\u00a33",
    "\u0003\u0002\u0002\u0002\u00a4\u00a2\u0003\u0002\u0002\u0002\u00a5\u00a7",
    "\u0005&\u0013\u0002\u00a6\u00a5\u0003\u0002\u0002\u0002\u00a7\u00aa",
    "\u0003\u0002\u0002\u0002\u00a8\u00a6\u0003\u0002\u0002\u0002\u00a8\u00a9",
    "\u0003\u0002\u0002\u0002\u00a9\u00ab\u0003\u0002\u0002\u0002\u00aa\u00a8",
    "\u0003\u0002\u0002\u0002\u00ab\u00af\u0007?\u0002\u0002\u00ac\u00ae",
    "\u0005&\u0013\u0002\u00ad\u00ac\u0003\u0002\u0002\u0002\u00ae\u00b1",
    "\u0003\u0002\u0002\u0002\u00af\u00ad\u0003\u0002\u0002\u0002\u00af\u00b0",
    "\u0003\u0002\u0002\u0002\u00b05\u0003\u0002\u0002\u0002\u00b1\u00af",
    "\u0003\u0002\u0002\u0002\u00b2\u00b4\u0007(\u0002\u0002\u00b3\u00b5",
    "\t\u0005\u0002\u0002\u00b4\u00b3\u0003\u0002\u0002\u0002\u00b5\u00b6",
    "\u0003\u0002\u0002\u0002\u00b6\u00b4\u0003\u0002\u0002\u0002\u00b6\u00b7",
    "\u0003\u0002\u0002\u0002\u00b7\u00b8\u0003\u0002\u0002\u0002\u00b8\u00b9",
    "\u0007=\u0002\u0002\u00b97\u0003\u0002\u0002\u0002\u00ba\u00bc\u0005",
    "&\u0013\u0002\u00bb\u00ba\u0003\u0002\u0002\u0002\u00bc\u00bf\u0003",
    "\u0002\u0002\u0002\u00bd\u00bb\u0003\u0002\u0002\u0002\u00bd\u00be\u0003",
    "\u0002\u0002\u0002\u00be\u00c1\u0003\u0002\u0002\u0002\u00bf\u00bd\u0003",
    "\u0002\u0002\u0002\u00c0\u00c2\t\u0006\u0002\u0002\u00c1\u00c0\u0003",
    "\u0002\u0002\u0002\u00c2\u00c3\u0003\u0002\u0002\u0002\u00c3\u00c1\u0003",
    "\u0002\u0002\u0002\u00c3\u00c4\u0003\u0002\u0002\u0002\u00c4\u00c8\u0003",
    "\u0002\u0002\u0002\u00c5\u00c7\u0005&\u0013\u0002\u00c6\u00c5\u0003",
    "\u0002\u0002\u0002\u00c7\u00ca\u0003\u0002\u0002\u0002\u00c8\u00c6\u0003",
    "\u0002\u0002\u0002\u00c8\u00c9\u0003\u0002\u0002\u0002\u00c99\u0003",
    "\u0002\u0002\u0002\u00ca\u00c8\u0003\u0002\u0002\u0002\u00cb\u00cc\t",
    "\u0007\u0002\u0002\u00cc\u00cd\u0007?\u0002\u0002\u00cd;\u0003\u0002",
    "\u0002\u0002\u00ce\u00d0\n\b\u0002\u0002\u00cf\u00ce\u0003\u0002\u0002",
    "\u0002\u00d0\u00d1\u0003\u0002\u0002\u0002\u00d1\u00cf\u0003\u0002\u0002",
    "\u0002\u00d1\u00d2\u0003\u0002\u0002\u0002\u00d2=\u0003\u0002\u0002",
    "\u0002\u00d3\u00d7\t\t\u0002\u0002\u00d4\u00d6\t\n\u0002\u0002\u00d5",
    "\u00d4\u0003\u0002\u0002\u0002\u00d6\u00d9\u0003\u0002\u0002\u0002\u00d7",
    "\u00d5\u0003\u0002\u0002\u0002\u00d7\u00d8\u0003\u0002\u0002\u0002\u00d8",
    "?\u0003\u0002\u0002\u0002\u00d9\u00d7\u0003\u0002\u0002\u0002\u00da",
    "\u00db\u0007^\u0002\u0002\u00db\u00dc\u0005*\u0015\u0002\u00dc\u00dd",
    "\u0003\u0002\u0002\u0002\u00dd\u00de\b \u0002\u0002\u00deA\u0003\u0002",
    "\u0002\u0002\u00df\u00e3\t\u000b\u0002\u0002\u00e0\u00e2\t\n\u0002\u0002",
    "\u00e1\u00e0\u0003\u0002\u0002\u0002\u00e2\u00e5\u0003\u0002\u0002\u0002",
    "\u00e3\u00e1\u0003\u0002\u0002\u0002\u00e3\u00e4\u0003\u0002\u0002\u0002",
    "\u00e4C\u0003\u0002\u0002\u0002\u00e5\u00e3\u0003\u0002\u0002\u0002",
    "\u00e6\u00e8\n\f\u0002\u0002\u00e7\u00e6\u0003\u0002\u0002\u0002\u00e8",
    "\u00e9\u0003\u0002\u0002\u0002\u00e9\u00e7\u0003\u0002\u0002\u0002\u00e9",
    "\u00ea\u0003\u0002\u0002\u0002\u00eaE\u0003\u0002\u0002\u0002\u00eb",
    "\u00ec\u0007+\u0002\u0002\u00ec\u00ed\u0003\u0002\u0002\u0002\u00ed",
    "\u00ee\b#\u0004\u0002\u00eeG\u0003\u0002\u0002\u0002\u0013\u0002\u0003",
    "N\\\u0089\u009b\u00a2\u00a8\u00af\u00b6\u00bd\u00c3\u00c8\u00d1\u00d7",
    "\u00e3\u00e9\u0005\u0002\u0003\u0002\u0007\u0003\u0002\u0006\u0002\u0002"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class RiScriptLexer extends antlr4.Lexer {

    static grammarFileName = "RiScriptLexer.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE", "MDL" ];
	static literalNames = [ null, null, null, null, null, "'('", null, "'['", 
                         "']'", "'{'", "'}'", "'/'", "'*'", "'$'", "','", 
                         "'>'", "'<'", "'.'" ];
	static symbolicNames = [ null, "LCOMM", "BCOMM", "LCBQ", "MDLS", "LP", 
                          "RP", "LB", "RB", "LCB", "RCB", "FS", "AST", "DOL", 
                          "COM", "GT", "LT", "DOT", "WS", "ESC", "NL", "DIDENT", 
                          "DYN", "SYM", "OR", "EQ", "ENT", "INT", "OP", 
                          "CHR", "IDENT", "CONT", "MDLT", "MDLE" ];
	static ruleNames = [ "LCOMM", "BCOMM", "LCBQ", "MDLS", "LP", "RP", "LB", 
                      "RB", "LCB", "RCB", "FS", "AST", "DOL", "COM", "GT", 
                      "LT", "DOT", "WS", "ESC", "NL", "DIDENT", "DYN", "SYM", 
                      "OR", "EQ", "ENT", "INT", "OP", "CHR", "IDENT", "CONT", 
                      "NIDENT", "MDLT", "MDLE" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    }

    get atn() {
        return atn;
    }
}

RiScriptLexer.EOF = antlr4.Token.EOF;
RiScriptLexer.LCOMM = 1;
RiScriptLexer.BCOMM = 2;
RiScriptLexer.LCBQ = 3;
RiScriptLexer.MDLS = 4;
RiScriptLexer.LP = 5;
RiScriptLexer.RP = 6;
RiScriptLexer.LB = 7;
RiScriptLexer.RB = 8;
RiScriptLexer.LCB = 9;
RiScriptLexer.RCB = 10;
RiScriptLexer.FS = 11;
RiScriptLexer.AST = 12;
RiScriptLexer.DOL = 13;
RiScriptLexer.COM = 14;
RiScriptLexer.GT = 15;
RiScriptLexer.LT = 16;
RiScriptLexer.DOT = 17;
RiScriptLexer.WS = 18;
RiScriptLexer.ESC = 19;
RiScriptLexer.NL = 20;
RiScriptLexer.DIDENT = 21;
RiScriptLexer.DYN = 22;
RiScriptLexer.SYM = 23;
RiScriptLexer.OR = 24;
RiScriptLexer.EQ = 25;
RiScriptLexer.ENT = 26;
RiScriptLexer.INT = 27;
RiScriptLexer.OP = 28;
RiScriptLexer.CHR = 29;
RiScriptLexer.IDENT = 30;
RiScriptLexer.CONT = 31;
RiScriptLexer.MDLT = 32;
RiScriptLexer.MDLE = 33;

RiScriptLexer.MDL = 1;




