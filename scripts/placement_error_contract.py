#!/usr/bin/env python3
"""Exercise the native placement callback with controlled provider results."""
import pathlib,subprocess,json,sys,hashlib,os
import tempfile
repo=pathlib.Path(__file__).resolve().parents[1]
r=pathlib.Path(tempfile.mkdtemp(prefix='placement-error-contract-'))
revision=sys.argv[1] if len(sys.argv)>1 else 'WORKTREE'
label=sys.argv[2] if len(sys.argv)>2 else 'before'
out=r/'native-boundary'/label;out.mkdir(parents=True,exist_ok=True)
s=(repo/'ios/RNPurchases.m').read_text() if revision=='WORKTREE' else subprocess.check_output(['git','-C',str(repo),'show',revision+':ios/RNPurchases.m'],text=True)
(out/'RNPurchases.original.m').write_text(s)
def method(marker):
 start=s.index(marker);brace=s.index('{',start);depth=1;end=brace+1
 while depth:
  if s[end]=='{':depth+=1
  elif s[end]=='}':depth-=1
  end+=1
 return s[start:end]
methods=[method('RCT_EXPORT_METHOD(getCurrentOfferingForPlacement:'),method('- (void)rejectPromiseWithBlock:(RCTPromiseRejectBlock)reject error:'),method('- (void (^)(NSDictionary *, RCErrorContainer *))getResponseCompletionBlockWithResolve:')]
head=r'''#import <Foundation/Foundation.h>
typedef void (^RCTPromiseResolveBlock)(id);
typedef void (^RCTPromiseRejectBlock)(NSString *,NSString *,NSError *);
#define RCT_EXPORT_METHOD(method) - (void)method
@interface NSString (Mapping)
@property(readonly) NSString *mappingNSNullToNil;
@end
@implementation NSString (Mapping)
- (NSString *)mappingNSNullToNil {return self;}
@end
@interface RCErrorContainer : NSObject
@property NSInteger code;
@property NSString *message;
@property NSDictionary *info;
@property NSError *error;
@end
@implementation RCErrorContainer
@end
static NSDictionary *providerValue;
static RCErrorContainer *providerError;
@interface RCCommonFunctionality : NSObject
+ (void)getCurrentOfferingForPlacement:(NSString *)placement completionBlock:(void (^)(NSDictionary *,RCErrorContainer *))block;
@end
@implementation RCCommonFunctionality
+ (void)getCurrentOfferingForPlacement:(NSString *)placement completionBlock:(void (^)(NSDictionary *,RCErrorContainer *))block {block(providerValue,providerError);}
@end
@interface RNPurchases : NSObject
@end
@implementation RNPurchases
'''
main=r'''
@end
int main() { @autoreleasepool {
 NSMutableArray *rows=[NSMutableArray array]; int failed=0;
 for (NSDictionary *c in @[
  @{ @"name":@"network-error", @"code":@10 },
  @{ @"name":@"configuration-error", @"code":@23 },
  @{ @"name":@"invalid-credentials", @"code":@11 },
  @{ @"name":@"no-offering", @"value":[NSNull null] },
  @{ @"name":@"empty-dictionary-control", @"value":@{} },
  @{ @"name":@"present-offering", @"value":@{@"identifier":@"default"} }
 ]) {
  providerValue=nil;providerError=nil;
  if(c[@"code"]) {
   providerError=[RCErrorContainer new]; providerError.code=[c[@"code"] integerValue];providerError.message=@"Test native error";
   providerError.info=@{@"underlyingErrorMessage":@"Test underlying failure"};
   providerError.error=[NSError errorWithDomain:@"RCPurchasesErrorDomain" code:providerError.code userInfo:providerError.info];
  } else if(c[@"value"] != [NSNull null]) { providerValue=c[@"value"]; }
  __block int resolved=0,rejected=0; __block id actualValue=nil; __block NSString *actualCode=nil;
  [[RNPurchases new] getCurrentOfferingForPlacement:@"qa" resolve:^(id value){resolved++;actualValue=value;} reject:^(NSString *code,NSString *message,NSError *error){rejected++;actualCode=code;}];
  BOOL ok=c[@"code"] ? (rejected==1 && resolved==0 && [actualCode isEqual:[c[@"code"] stringValue]]) : (resolved==1 && rejected==0 && [(actualValue?:[NSNull null]) isEqual:c[@"value"]]);
  if(!ok)failed++;
  [rows addObject:@{@"case":c[@"name"],@"passed":@(ok),@"resolveCalls":@(resolved),@"rejectCalls":@(rejected),@"value":actualValue?:[NSNull null],@"code":actualCode?:[NSNull null]}];
 }
 NSData *json=[NSJSONSerialization dataWithJSONObject:rows options:NSJSONWritingPrettyPrinted error:nil];puts([[NSString alloc]initWithData:json encoding:NSUTF8StringEncoding].UTF8String);
 return failed?1:0;
} }
'''
if 'NSError *error' in methods[0]:
 head=head.replace('void (^)(NSDictionary *,RCErrorContainer *)','void (^)(NSDictionary *,NSError *)').replace('block(providerValue,providerError);','block(providerValue,providerError.error);')
(out/'boundary.m').write_text(head+'\n'.join(methods)+main)
env=os.environ.copy();# Use the caller's selected Xcode toolchain.
cmd=['xcrun','clang','-fobjc-arc','-fblocks','-framework','Foundation',str(out/'boundary.m'),'-o',str(out/'boundary')]
p=subprocess.run(cmd,env=env,capture_output=True,text=True);(out/'compile.log').write_text(p.stdout+p.stderr);p.check_returncode()
p=subprocess.run([str(out/'boundary')],capture_output=True,text=True);(out/'results.json').write_text(p.stdout);(out/'stderr.log').write_text(p.stderr)
summary=dict(revision=revision,label=label,sourceSHA256=hashlib.sha256(s.encode()).hexdigest(),command=cmd,exit=p.returncode,passed=sum(x['passed'] for x in json.loads(p.stdout)),failed=sum(not x['passed'] for x in json.loads(p.stdout)),limitation='Extracted unmodified production bridge/helper bodies; callback provider and dependency declarations are shims; no native app/backend execution.')
(out/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary));sys.exit(p.returncode)
